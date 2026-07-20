package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Notification;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.entity.UserNotificationPreferences;
import com.farmsetu.model.enums.NotificationType;
import com.farmsetu.model.enums.UserRole;
import com.farmsetu.repository.NotificationRepository;
import com.farmsetu.repository.UserNotificationPreferencesRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;
    private final Optional<SimpMessagingTemplate> messagingTemplate;

    public Map<String, Object> getForUser(Long userId, int page, int size) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.PageRequest.of(page, size));
        long totalElements = notificationRepository.countByUserId(userId);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        List<Map<String, Object>> mappedContent = notifications.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("notificationType", n.getNotificationType() != null ? n.getNotificationType().name() : "INFO");
            map.put("read", n.isRead());
            map.put("actionUrl", n.getActionUrl());
            map.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return Map.of(
            "content", mappedContent,
            "page", page,
            "size", size,
            "totalElements", totalElements,
            "totalPages", totalPages,
            "last", (page + 1) * size >= totalElements
        );
    }

    @Transactional
    public void markRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadNative(userId);
    }

    /**
     * Creates a notification for the target user AND an admin notification for platform admins with user details.
     */
    @Transactional
    public Notification create(Long userId, String title, String message,
                                NotificationType type, String actionUrl) {
        User targetUser = userRepository.findById(userId).orElse(null);
        
        // 1. Create notification for targeted user
        User userRef = targetUser != null ? targetUser : userRepository.getReferenceById(userId);
        Notification userNotification = notificationRepository.save(Notification.builder()
                .user(userRef)
                .title(title)
                .message(message)
                .notificationType(type != null ? type : NotificationType.GENERAL)
                .actionUrl(actionUrl)
                .build());

        // Broadcast real-time notification to user over WebSockets
        messagingTemplate.ifPresent(template -> {
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("id", userNotification.getId());
                payload.put("title", userNotification.getTitle());
                payload.put("message", userNotification.getMessage());
                payload.put("notificationType", userNotification.getNotificationType() != null ? userNotification.getNotificationType().name() : "INFO");
                payload.put("read", userNotification.isRead());
                payload.put("actionUrl", userNotification.getActionUrl());
                payload.put("createdAt", userNotification.getCreatedAt() != null ? userNotification.getCreatedAt().toString() : "");

                template.convertAndSend("/topic/notifications/" + userId, payload);
            } catch (Exception e) {
                log.warn("Could not broadcast real-time notification to user via STOMP: {}", e.getMessage());
            }
        });

        // 2. Create dual notification for Admin(s) with User + Notification Details
        boolean isTargetAdmin = targetUser != null && (targetUser.getRole() == UserRole.ADMIN || targetUser.getRole() == UserRole.SUPER_ADMIN);
        if (!isTargetAdmin) {
            try {
                List<User> admins = new ArrayList<>(userRepository.findByRole(UserRole.ADMIN));
                admins.addAll(userRepository.findByRole(UserRole.SUPER_ADMIN));

                String userName = targetUser != null ? targetUser.getName() : "User #" + userId;
                String userContact = targetUser != null && targetUser.getEmail() != null ? targetUser.getEmail() : (targetUser != null ? targetUser.getPhone() : "N/A");

                String adminTitle = "[User Alert] " + userName + ": " + title;
                String adminMessage = String.format("Notification dispatched for %s (%s, ID #%d) | Details: %s", userName, userContact, userId, message);
                String adminTypeStr = mapToAdminCategory(type);

                for (User admin : admins) {
                    Notification adminNotification = notificationRepository.save(Notification.builder()
                            .user(admin)
                            .title(adminTitle)
                            .message(adminMessage)
                            .notificationType(type != null ? type : NotificationType.SYSTEM)
                            .actionUrl(actionUrl != null ? actionUrl : "/admin/notifications")
                            .build());

                    // Broadcast real-time admin STOMP payload
                    messagingTemplate.ifPresent(template -> {
                        try {
                            Map<String, Object> adminPayload = new HashMap<>();
                            adminPayload.put("id", adminNotification.getId());
                            adminPayload.put("title", adminNotification.getTitle());
                            adminPayload.put("message", adminNotification.getMessage());
                            adminPayload.put("type", adminTypeStr);
                            adminPayload.put("read", false);
                            adminPayload.put("createdAt", adminNotification.getCreatedAt() != null ? adminNotification.getCreatedAt().toString() : "");

                            template.convertAndSend("/topic/admin.notifications", adminPayload);
                            template.convertAndSend("/topic/notifications/" + admin.getId(), adminPayload);
                        } catch (Exception e) {
                            log.warn("Could not broadcast real-time admin notification via STOMP: {}", e.getMessage());
                        }
                    });
                }
            } catch (Exception ex) {
                log.warn("Could not create dual admin notification: {}", ex.getMessage());
            }
        }

        return userNotification;
    }

    private String mapToAdminCategory(NotificationType type) {
        if (type == null) return "SYSTEM";
        switch (type) {
            case PRICE_ALERT:
            case WEATHER:
            case PEST_ALERT:
                return "ALERT";
            case MARKETPLACE:
                return "ORDER";
            case COMMUNITY:
            case TASK_REMINDER:
            case HARVEST_REMINDER:
                return "USER";
            case SCHEME_DEADLINE:
            case INSURANCE:
            case SYSTEM:
            case GENERAL:
            default:
                return "SYSTEM";
        }
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    public Map<String, Object> getPreferences(Long userId) {
        UserNotificationPreferences prefs = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> UserNotificationPreferences.builder()
                        .user(userRepository.getReferenceById(userId))
                        .emailAlerts(true)
                        .smsAlerts(true)
                        .whatsappAlerts(false)
                        .weatherWarnings(true)
                        .priceSurges(true)
                        .taskReminders(true)
                        .build());

        Map<String, Object> map = new HashMap<>();
        map.put("emailAlerts", prefs.isEmailAlerts());
        map.put("smsAlerts", prefs.isSmsAlerts());
        map.put("whatsappAlerts", prefs.isWhatsappAlerts());
        map.put("weatherWarnings", prefs.isWeatherWarnings());
        map.put("priceSurges", prefs.isPriceSurges());
        map.put("taskReminders", prefs.isTaskReminders());
        return map;
    }

    @Transactional
    public Map<String, Object> savePreferences(Long userId, Map<String, Object> prefsInput) {
        UserNotificationPreferences existing = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return UserNotificationPreferences.builder().user(user).build();
                });

        if (prefsInput.containsKey("emailAlerts")) existing.setEmailAlerts(Boolean.TRUE.equals(prefsInput.get("emailAlerts")));
        if (prefsInput.containsKey("smsAlerts")) existing.setSmsAlerts(Boolean.TRUE.equals(prefsInput.get("smsAlerts")));
        if (prefsInput.containsKey("whatsappAlerts")) existing.setWhatsappAlerts(Boolean.TRUE.equals(prefsInput.get("whatsappAlerts")));
        if (prefsInput.containsKey("weatherWarnings")) existing.setWeatherWarnings(Boolean.TRUE.equals(prefsInput.get("weatherWarnings")));
        if (prefsInput.containsKey("priceSurges")) existing.setPriceSurges(Boolean.TRUE.equals(prefsInput.get("priceSurges")));
        if (prefsInput.containsKey("taskReminders")) existing.setTaskReminders(Boolean.TRUE.equals(prefsInput.get("taskReminders")));

        UserNotificationPreferences saved = preferencesRepository.save(existing);

        Map<String, Object> map = new HashMap<>();
        map.put("emailAlerts", saved.isEmailAlerts());
        map.put("smsAlerts", saved.isSmsAlerts());
        map.put("whatsappAlerts", saved.isWhatsappAlerts());
        map.put("weatherWarnings", saved.isWeatherWarnings());
        map.put("priceSurges", saved.isPriceSurges());
        map.put("taskReminders", saved.isTaskReminders());
        return map;
    }
}

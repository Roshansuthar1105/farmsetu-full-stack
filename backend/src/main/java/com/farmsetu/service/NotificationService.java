package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Notification;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.NotificationType;
import com.farmsetu.repository.NotificationRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getForUser(Long userId, int page, int size) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.PageRequest.of(page, size));
        long totalElements = notificationRepository.countByUserId(userId);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        List<Map<String, Object>> mappedContent = notifications.stream().map(n -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
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

    @Transactional
    public Notification create(Long userId, String title, String message,
                               NotificationType type, String actionUrl) {
        User user = userRepository.getReferenceById(userId);
        return notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .notificationType(type)
                .actionUrl(actionUrl)
                .build());
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    public Map<String, Object> savePreferences(Map<String, Object> prefs) {
        return prefs;
    }
}

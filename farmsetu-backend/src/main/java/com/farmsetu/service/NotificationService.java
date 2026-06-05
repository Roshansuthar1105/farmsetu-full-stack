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

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public java.util.List<java.util.Map<String, Object>> getForUser(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDescNative(userId, size, page * size);
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

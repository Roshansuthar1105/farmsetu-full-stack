package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ApiResponse<Map<String, Object>> list(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(notificationService.getForUser(userId, page, size));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ApiResponse.ok(null);
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllRead(@RequestParam Long userId) {
        notificationService.markAllRead(userId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/preferences")
    public ApiResponse<Map<String, Object>> getPreferences() {
        Long userId = SecurityUtils.currentUserId();
        return ApiResponse.ok(notificationService.getPreferences(userId));
    }

    @PostMapping("/preferences")
    public ApiResponse<Map<String, Object>> preferences(@RequestBody Map<String, Object> prefs) {
        Long userId = SecurityUtils.currentUserId();
        return ApiResponse.ok(notificationService.savePreferences(userId, prefs));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ApiResponse.ok(null);
    }
}

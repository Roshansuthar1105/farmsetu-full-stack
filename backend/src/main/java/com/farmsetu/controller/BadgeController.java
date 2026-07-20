package com.farmsetu.controller;

import com.farmsetu.model.dto.badge.BadgeWithStatusResponse;
import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ApiResponse<List<BadgeWithStatusResponse>> getMyBadges() {
        Long userId = SecurityUtils.currentUserId();
        return ApiResponse.ok(badgeService.getAllBadgesWithStatus(userId));
    }

    @PostMapping("/{badgeId}/claim")
    public ApiResponse<BadgeWithStatusResponse> claimBadge(@PathVariable Long badgeId) {
        Long userId = SecurityUtils.currentUserId();
        return ApiResponse.ok(badgeService.claimBadge(userId, badgeId));
    }
}

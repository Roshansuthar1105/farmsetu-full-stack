package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.request.BadgeRequest;
import com.farmsetu.model.entity.Badge;
import com.farmsetu.service.BadgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
@RequestMapping("/api/admin/badges")
@RequiredArgsConstructor
public class AdminBadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getBadges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Page<Badge> badgePage = badgeService.getAdminBadges(PageRequest.of(page, size), search);
        Map<String, Object> response = Map.of(
                "content", badgePage.getContent(),
                "page", badgePage.getNumber(),
                "size", badgePage.getSize(),
                "totalElements", badgePage.getTotalElements(),
                "totalPages", badgePage.getTotalPages(),
                "last", badgePage.isLast()
        );
        return ApiResponse.ok(response);
    }

    @PostMapping
    public ApiResponse<Badge> createBadge(@Valid @RequestBody BadgeRequest request) {
        return ApiResponse.ok(badgeService.createBadge(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Badge> updateBadge(@PathVariable Long id, @Valid @RequestBody BadgeRequest request) {
        return ApiResponse.ok(badgeService.updateBadge(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBadge(@PathVariable Long id) {
        badgeService.deleteBadge(id);
        return ApiResponse.ok("Badge deleted successfully", null);
    }
}

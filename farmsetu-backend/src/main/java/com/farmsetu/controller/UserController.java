package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.user.UpdateUserRequest;
import com.farmsetu.model.dto.user.UserResponse;
import com.farmsetu.model.entity.UserBadge;
import com.farmsetu.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUser(@PathVariable Long id) {
        return ApiResponse.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.ok("User deactivated", null);
    }

    @PutMapping("/{id}/profile-photo")
    public ApiResponse<UserResponse> updatePhoto(@PathVariable Long id, @RequestParam String url) {
        return ApiResponse.ok(userService.updateProfilePhoto(id, url));
    }

    @GetMapping("/{id}/badges")
    public ApiResponse<List<UserBadge>> badges(@PathVariable Long id) {
        return ApiResponse.ok(userService.getBadges(id));
    }

    @GetMapping("/{id}/activity")
    public ApiResponse<Map<String, Object>> activity(@PathVariable Long id) {
        return ApiResponse.ok(Map.of("userId", id, "activities", List.of()));
    }
}

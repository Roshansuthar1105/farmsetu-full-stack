package com.farmsetu.controller;

import com.farmsetu.model.dto.auth.AuthResponse;
import com.farmsetu.model.dto.auth.LoginRequest;
import com.farmsetu.model.dto.auth.OtpVerifyRequest;
import com.farmsetu.model.dto.auth.RefreshTokenRequest;
import com.farmsetu.model.dto.auth.RegisterRequest;
import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.user.UserResponse;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.security.UserPrincipal;
import com.farmsetu.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok("Logged out", null);
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        UserPrincipal principal = SecurityUtils.currentUser();
        return ApiResponse.ok(authService.refreshToken(request.getRefreshToken(), principal));
    }

    @PostMapping("/verify-otp")
    public ApiResponse<Map<String, String>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ApiResponse.ok(Map.of("status", "verified", "phone", request.getPhone()));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(Map.of("message", "OTP sent if account exists"));
    }

    @PostMapping("/reset-password")
    public ApiResponse<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(Map.of("message", "Password reset successful"));
    }

    @PostMapping("/google-login")
    public ApiResponse<Map<String, String>> googleLogin(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(Map.of("message", "Wire Google OAuth in configuration"));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(authService.me(SecurityUtils.currentUser()));
    }
}

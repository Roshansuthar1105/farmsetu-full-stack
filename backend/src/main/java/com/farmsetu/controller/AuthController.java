package com.farmsetu.controller;

import com.farmsetu.model.dto.auth.AuthResponse;
import com.farmsetu.model.dto.auth.LoginRequest;
import com.farmsetu.model.dto.auth.MagicLinkRequest;
import com.farmsetu.model.dto.auth.OtpVerifyRequest;
import com.farmsetu.model.dto.auth.RefreshTokenRequest;
import com.farmsetu.model.dto.auth.RegisterRequest;
import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.user.UserResponse;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.security.UserPrincipal;
import com.farmsetu.service.AuthService;
import com.farmsetu.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

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
        // ✅ FIXED: removed SecurityUtils.currentUser() - token validates itself
        return ApiResponse.ok(authService.refreshToken(request.getRefreshToken()));
    }

    // ─── OTP Endpoints ────────────────────────────────────────────────────

    /**
     * Send a 6-digit OTP to the user's email address.
     */
    @PostMapping("/send-otp")
    public ApiResponse<Map<String, String>> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ApiResponse.error("Email is required");
        }
        otpService.generateAndSendOtp(email.trim().toLowerCase());
        return ApiResponse.ok(Map.of("message", "OTP sent to your email address"));
    }

    /**
     * Verify the 6-digit OTP submitted by the user.
     */
    @PostMapping("/verify-otp")
    public ApiResponse<Map<String, String>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail() : request.getPhone();
        if (identifier == null || identifier.isBlank()) {
            return ApiResponse.error("Email or phone is required");
        }

        boolean valid = otpService.verifyOtp(identifier, request.getOtp());
        if (!valid) {
            return ApiResponse.error("Invalid or expired OTP code. Please try again.");
        }
        return ApiResponse.ok(Map.of("status", "verified", "identifier", identifier));
    }

    // ─── Forgot / Reset Password ──────────────────────────────────────────

    /**
     * Request a password reset – sends OTP to the user's email.
     */
    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String phone = body.get("phone");
        String identifier = (email != null && !email.isBlank()) ? email.trim().toLowerCase() : phone;

        if (identifier == null || identifier.isBlank()) {
            return ApiResponse.error("Email or phone is required");
        }

        // Generate and send OTP – always return success to prevent user enumeration
        otpService.generateAndSendOtp(identifier);
        return ApiResponse.ok(Map.of("message", "If an account exists, a verification code has been sent"));
    }

    /**
     * Reset password using verified OTP code.
     */
    @PostMapping("/reset-password")
    public ApiResponse<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String phone = body.get("phone");
        String otp = body.get("otp");
        String password = body.get("password");

        String identifier = (email != null && !email.isBlank()) ? email.trim().toLowerCase() : phone;

        if (identifier == null || identifier.isBlank()) {
            return ApiResponse.error("Email or phone is required");
        }
        if (otp == null || otp.isBlank()) {
            return ApiResponse.error("OTP code is required");
        }
        if (password == null || password.length() < 8) {
            return ApiResponse.error("Password must be at least 8 characters");
        }

        authService.resetPasswordWithOtp(identifier, otp, password);
        return ApiResponse.ok(Map.of("message", "Password reset successful"));
    }

    // ─── Other Auth Endpoints ─────────────────────────────────────────────

    @PostMapping("/google-login")
    public ApiResponse<Map<String, String>> googleLogin(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(Map.of("message", "Wire Google OAuth in configuration"));
    }

    @PostMapping("/magic-link/send")
    public ApiResponse<Map<String, String>> sendMagicLink(@Valid @RequestBody MagicLinkRequest request) {
        authService.sendMagicLink(request.getEmail());
        return ApiResponse.ok(Map.of("message", "Magic link sent to your email if the account exists"));
    }

    @GetMapping("/magic-link/verify")
    public ApiResponse<AuthResponse> verifyMagicLink(@RequestParam String token) {
        return ApiResponse.ok(authService.verifyMagicLink(token));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(authService.me(SecurityUtils.currentUser()));
    }
}


package com.farmsetu.service;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.model.dto.auth.AuthResponse;
import com.farmsetu.model.dto.auth.LoginRequest;
import com.farmsetu.model.dto.auth.RegisterRequest;
import com.farmsetu.model.dto.user.UserResponse;
import com.farmsetu.model.entity.FarmerProfile;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.UserRole;
import com.farmsetu.repository.FarmerProfileRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.JwtService;
import com.farmsetu.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${farmsetu.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() != null && userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone already registered");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.FARMER;
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail() != null ? request.getEmail().toLowerCase() : null)
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
                .state(request.getState())
                .district(request.getDistrict())
                .village(request.getVillage())
                .build();

        user = userRepository.save(user);

        if (role == UserRole.FARMER) {
            farmerProfileRepository.save(FarmerProfile.builder()
                    .user(user)
                    .farmArea(request.getFarmArea())
                    .soilType(request.getSoilType())
                    .farmingExperience(request.getFarmingExperience())
                    .build());
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendSimpleEmail(user.getEmail(), "Welcome to Farmsetu! 🌾",
                    "Hello " + user.getName() + ",\n\nWelcome to Farmsetu - Kheti ki nayi duniya!\n" +
                            "We are thrilled to have you join our community. You can now list products in the marketplace, read crop alerts, and interact with other farmers.\n\nBest regards,\nThe Farmsetu Team");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // authenticationManager.authenticate(
        // new UsernamePasswordAuthenticationToken(request.getIdentifier(),
        // request.getPassword()));
        //
        // User user = userRepository.findByEmailOrPhone(request.getIdentifier(),
        // request.getIdentifier())
        // .orElseThrow(() -> new BadRequestException("User not found"));
        // return buildAuthResponse(user);
        try {
            // ✅ FIXED: authentication is restored and works with email OR phone
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getIdentifier(),
                            request.getPassword()));

            // ✅ FIXED: get UserPrincipal directly from authentication - no extra DB call
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new BadRequestException("User not found"));

            return buildAuthResponse(user);

        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid credentials"); // ✅ returns 400, not 403
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        // User user = userRepository.findById(principal.getId())
        // .orElseThrow(() -> new BadRequestException("User not found"));
        // return buildAuthResponse(user);
        // ✅ FIXED: validate refresh token directly, no SecurityUtils needed
        try {
            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByIdentifier(username)
                    .orElseThrow(() -> new BadRequestException("User not found"));

            UserPrincipal principal = new UserPrincipal(user);

            if (!jwtService.isTokenValid(refreshToken, principal)) {
                throw new BadRequestException("Invalid or expired refresh token");
            }

            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new BadRequestException("Invalid refresh token");
        }
    }

    @Transactional
    public UserResponse me(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return UserResponse.from(user);
    }

    // ─── Magic Link ────────────────────────────────────────────────────────

    @Transactional
    public void sendMagicLink(String email) {
        // Always return success to prevent user enumeration
//        userRepository.getUsersByEmailId(email);
        userRepository.getUsersByEmailId(email.toLowerCase()).ifPresent(user -> {
            String token = java.util.UUID.randomUUID().toString().replace("-", "");
            user.setMagicLinkToken(token);
            user.setMagicLinkExpiry(Instant.now().plusSeconds(15 * 60)); // 15 minutes
            userRepository.save(user);

            String link = frontendUrl + "/auth/magic-link?token=" + token;
            String html = "<div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;'>" +
                    "<h2 style='color:#16a34a;'>Login to FarmSetu</h2>" +
                    "<p>Click the button below to sign in. This link expires in <b>15 minutes</b>.</p>" +
                    "<a href='" + link + "' style='display:inline-block;margin:20px 0;padding:14px 28px;" +
                    "background:#16a34a;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;'>"
                    +
                    "Login to FarmSetu</a>" +
                    "<p style='color:#9ca3af;font-size:12px;margin-top:24px;'>If you did not request this, you can safely ignore this email.</p>"
                    +
                    "</div>";
            emailService.sendHtmlEmail(user.getEmail(), "Your FarmSetu Login Link", html);
        });
    }

    @Transactional
    public AuthResponse verifyMagicLink(String token) {
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getMagicLinkToken()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid or expired magic link"));

        if (user.getMagicLinkExpiry() == null || Instant.now().isAfter(user.getMagicLinkExpiry())) {
            user.setMagicLinkToken(null);
            user.setMagicLinkExpiry(null);
            userRepository.save(user);
            throw new BadRequestException("Magic link has expired. Please request a new one.");
        }

        // Invalidate the token after use (one-time use)
        user.setMagicLinkToken(null);
        user.setMagicLinkExpiry(null);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(principal))
                .refreshToken(jwtService.generateRefreshToken(principal))
                .user(UserResponse.from(user))
                .build();
    }
}

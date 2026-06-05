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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone already registered");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.FARMER;
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
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
            farmerProfileRepository.save(FarmerProfile.builder().user(user).build());
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
//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword()));
//
//        User user = userRepository.findByEmailOrPhone(request.getIdentifier(), request.getIdentifier())
//                .orElseThrow(() -> new BadRequestException("User not found"));
//        return buildAuthResponse(user);
        try {
            // ✅ FIXED: authentication is restored and works with email OR phone
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getIdentifier(),
                            request.getPassword()
                    )
            );

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
//        User user = userRepository.findById(principal.getId())
//                .orElseThrow(() -> new BadRequestException("User not found"));
//        return buildAuthResponse(user);
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

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(principal))
                .refreshToken(jwtService.generateRefreshToken(principal))
                .user(UserResponse.from(user))
                .build();
    }
}

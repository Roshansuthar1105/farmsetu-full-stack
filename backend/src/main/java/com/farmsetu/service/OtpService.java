package com.farmsetu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP generation, caching, and verification service.
 * OTP codes are stored with a configurable TTL (default 10 minutes)
 * and are invalidated after a single successful verification.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final long OTP_TTL_SECONDS = 10 * 60; // 10 minutes
    private static final int MAX_ATTEMPTS = 5;

    private final EmailService emailService;

    /** Cache: normalised email → OtpEntry */
    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    // ─── Internal record ──────────────────────────────────────────────────
    private record OtpEntry(String code, Instant expiresAt, int attempts) {}

    // ─── Public API ───────────────────────────────────────────────────────

    /**
     * Generates a 6-digit OTP, stores it in the in-memory cache,
     * and dispatches a branded HTML email via Brevo.
     *
     * @param email recipient email address (case-insensitive)
     * @return the generated OTP code (useful for logging in dev mode)
     */
    public String generateAndSendOtp(String email) {
        String key = email.trim().toLowerCase();
        String code = generateSecureCode();

        otpStore.put(key, new OtpEntry(code, Instant.now().plusSeconds(OTP_TTL_SECONDS), 0));
        log.info("OTP generated for {}: {} (expires in {} min)", key, code, OTP_TTL_SECONDS / 60);

        String html = buildOtpEmailHtml(code);
        emailService.sendHtmlEmail(key, "Your FarmSetu Verification Code", html);

        return code;
    }

    /**
     * Verifies the OTP code submitted by the user.
     *
     * @param email user email
     * @param code  6-digit OTP entered by the user
     * @return true if valid, false otherwise
     */
    public boolean verifyOtp(String email, String code) {
        String key = email.trim().toLowerCase();
        OtpEntry entry = otpStore.get(key);

        if (entry == null) {
            log.warn("OTP verification failed – no OTP found for {}", key);
            return false;
        }

        // Expired
        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(key);
            log.warn("OTP verification failed – code expired for {}", key);
            return false;
        }

        // Too many attempts
        if (entry.attempts() >= MAX_ATTEMPTS) {
            otpStore.remove(key);
            log.warn("OTP verification failed – max attempts exceeded for {}", key);
            return false;
        }

        // Code mismatch → increment attempt counter
        if (!entry.code().equals(code.trim())) {
            otpStore.put(key, new OtpEntry(entry.code(), entry.expiresAt(), entry.attempts() + 1));
            log.warn("OTP verification failed – wrong code for {} (attempt {})", key, entry.attempts() + 1);
            return false;
        }

        // ✅ Valid – remove from store (one-time use)
        otpStore.remove(key);
        log.info("OTP verified successfully for {}", key);
        return true;
    }

    /**
     * Check if an OTP exists and is still valid for a given email (without consuming it).
     */
    public boolean hasValidOtp(String email) {
        String key = email.trim().toLowerCase();
        OtpEntry entry = otpStore.get(key);
        return entry != null && Instant.now().isBefore(entry.expiresAt());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private String generateSecureCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", code);
    }

    private String buildOtpEmailHtml(String code) {
        String[] digits = code.split("");
        StringBuilder digitBoxes = new StringBuilder();
        for (String d : digits) {
            digitBoxes.append(
                "<span style=\"display:inline-block;width:42px;height:52px;line-height:52px;" +
                "font-size:26px;font-weight:700;color:#065f46;background:#ecfdf5;" +
                "border:2px solid #a7f3d0;border-radius:10px;text-align:center;" +
                "margin:0 4px;font-family:'Segoe UI',Roboto,monospace;\">")
              .append(d)
              .append("</span>");
        }

        return """
            <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">

              <!-- Header Banner -->
              <div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 24px;text-align:center;">
                <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">🌾 FarmSetu</h1>
                <p style="margin:8px 0 0;font-size:13px;color:#d1fae5;font-weight:500;">Secure Verification Code</p>
              </div>

              <!-- Body -->
              <div style="padding:32px 28px 24px;">
                <p style="margin:0 0 6px;font-size:15px;color:#374151;line-height:1.6;">
                  Hello,
                </p>
                <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                  Use the following one-time verification code to complete your action on <strong style="color:#065f46;">FarmSetu</strong>:
                </p>

                <!-- OTP Digits -->
                <div style="text-align:center;margin:0 0 24px;">
                  %s
                </div>

                <!-- Expiry Notice -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin:0 0 24px;">
                  <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">
                    ⏱ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                  </p>
                </div>

                <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                  If you did not request this code, you can safely ignore this email. Your account remains secure.
                </p>
              </div>

              <!-- Footer -->
              <div style="border-top:1px solid #f3f4f6;padding:16px 28px;text-align:center;background:#f9fafb;">
                <p style="margin:0;font-size:11px;color:#9ca3af;">
                  Sent with ❤️ by FarmSetu Platform · <a href="#" style="color:#10b981;text-decoration:none;">farmsetu.com</a>
                </p>
              </div>
            </div>
            """.formatted(digitBoxes.toString());
    }
}

package com.farmsetu.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {

    private String phone;

    private String email;

    @NotBlank
    private String otp;

    /**
     * Returns the identifier (email preferred, fallback to phone).
     */
    public String getIdentifier() {
        if (email != null && !email.isBlank()) return email.trim().toLowerCase();
        if (phone != null && !phone.isBlank()) return phone.trim();
        return null;
    }
}

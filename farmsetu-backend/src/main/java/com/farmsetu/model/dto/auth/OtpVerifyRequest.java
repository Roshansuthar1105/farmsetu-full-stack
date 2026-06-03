package com.farmsetu.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotBlank
    private String phone;

    @NotBlank
    private String otp;
}

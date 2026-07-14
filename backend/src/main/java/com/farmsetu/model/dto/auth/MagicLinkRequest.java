package com.farmsetu.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MagicLinkRequest {
    @NotBlank
    @Email
    private String email;
}

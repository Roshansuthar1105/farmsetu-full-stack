package com.farmsetu.model.dto.auth;

import com.farmsetu.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @Email
    private String email;

    private String phone;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    private UserRole role;
    private String preferredLanguage;
    private String state;
    private String district;
    private String village;
    private Double farmArea;
    private String soilType;
    private Integer farmingExperience;
}

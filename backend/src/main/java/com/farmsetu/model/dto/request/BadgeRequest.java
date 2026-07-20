package com.farmsetu.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeRequest {
    private Long id;

    @NotBlank(message = "Badge name is required")
    private String name;

    private String hindiName;
    private String description;
    private String hindiDescription;
    private String iconUrl;
    private String badgeType;
    private String category;
    private String rarity;
    private String criteriaType;
    private Integer thresholdValue;
    private String gradientStyle;

    @NotNull(message = "Points required is mandatory")
    private Integer pointsRequired;
}

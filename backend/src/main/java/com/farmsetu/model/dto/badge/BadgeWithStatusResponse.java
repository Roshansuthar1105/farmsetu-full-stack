package com.farmsetu.model.dto.badge;

import com.farmsetu.model.entity.Badge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeWithStatusResponse {
    private Long id;
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
    private Integer pointsRequired;
    
    private Boolean isUnlocked;
    private Boolean isEligible;
    private Instant earnedAt;
    private Integer currentProgress;

    public static BadgeWithStatusResponse from(Badge badge, boolean isUnlocked, boolean isEligible, Instant earnedAt, int currentProgress) {
        return BadgeWithStatusResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .hindiName(badge.getHindiName())
                .description(badge.getDescription())
                .hindiDescription(badge.getHindiDescription())
                .iconUrl(badge.getIconUrl())
                .badgeType(badge.getBadgeType())
                .category(badge.getCategory())
                .rarity(badge.getRarity())
                .criteriaType(badge.getCriteriaType())
                .thresholdValue(badge.getThresholdValue())
                .gradientStyle(badge.getGradientStyle())
                .pointsRequired(badge.getPointsRequired())
                .isUnlocked(isUnlocked)
                .isEligible(isEligible)
                .earnedAt(earnedAt)
                .currentProgress(currentProgress)
                .build();
    }
}

package com.farmsetu.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "hindi_name")
    private String hindiName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "hindi_description", columnDefinition = "TEXT")
    private String hindiDescription;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "badge_type")
    private String badgeType;

    @Column(name = "category")
    private String category;

    @Column(name = "rarity")
    private String rarity;

    @Column(name = "criteria_type")
    private String criteriaType;

    @Column(name = "threshold_value")
    private Integer thresholdValue;

    @Column(name = "gradient_style")
    private String gradientStyle;

    @Column(name = "points_required")
    private Integer pointsRequired;
}

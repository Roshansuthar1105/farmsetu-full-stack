package com.farmsetu.model.entity;

import com.farmsetu.model.enums.UserRole;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "currentCrops", "farmerProfile", "passwordHash"})
public class User extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.FARMER;

    @Column(name = "profile_photo")
    private String profilePhoto;

    private String bio;

    @com.fasterxml.jackson.annotation.JsonProperty("isAi")
    @Column(name = "is_ai")
    @Builder.Default
    private Boolean isAi = false;

    @Column(name = "preferred_language")
    @Builder.Default
    private String preferredLanguage = "en";

    private Double latitude;
    private Double longitude;
    private String state;
    private String district;
    private String village;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "two_factor_enabled")
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "reputation_score")
    @Builder.Default
    private Integer reputationScore = 0;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private FarmerProfile farmerProfile;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_current_crops", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "crop_name")
    @Builder.Default
    private List<String> currentCrops = new ArrayList<>();

    public boolean isVerified() {
        return verified != null && verified;
    }

    public boolean isActive() {
        return active != null && active;
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled != null && twoFactorEnabled;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isAi")
    public boolean isAi() {
        return isAi != null && isAi;
    }
}

package com.farmsetu.model.entity;

import com.farmsetu.model.enums.FarmingType;
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

@Entity
@Table(name = "farmer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "farm_area")
    private Double farmArea;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "soil_ph")
    private Double soilPh;

    @Column(name = "water_source")
    private String waterSource;

    @Column(name = "farming_experience")
    private Integer farmingExperience;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "farmer_profile_crops", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "crop_name")
    @Builder.Default
    private List<String> currentCrops = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "farming_type")
    private FarmingType farmingType;
}

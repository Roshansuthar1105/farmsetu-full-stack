package com.farmsetu.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.farmsetu.model.enums.FarmingType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "farms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Farm extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "farm_area")
    private Double farmArea;

    @Column(name = "calculated_area")
    private Double calculatedArea;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "soil_ph")
    private Double soilPh;

    @Column(name = "water_source")
    private String waterSource;

    @Enumerated(EnumType.STRING)
    @Column(name = "farming_type")
    private FarmingType farmingType;

    @Column(name = "farm_boundary", columnDefinition = "TEXT")
    private String farmBoundary;

    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private Double temperature;
    private Double humidity;
    private Double rainfall;

    @Column(name = "water_level")
    private Double waterLevel;

    private Double latitude;
    private Double longitude;
}

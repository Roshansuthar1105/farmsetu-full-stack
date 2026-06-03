package com.farmsetu.model.entity;

import com.farmsetu.model.enums.CropSeason;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "crops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crop extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "local_names", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> localNames = new HashMap<>();

    @Enumerated(EnumType.STRING)
    private CropSeason season;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "crop_soil_types", joinColumns = @JoinColumn(name = "crop_id"))
    @Column(name = "soil_type")
    @Builder.Default
    private List<String> soilTypes = new ArrayList<>();

    @Column(name = "water_requirement")
    private String waterRequirement;

    @Column(name = "growing_days")
    private Integer growingDays;

    @Column(name = "average_yield_per_acre", precision = 10, scale = 2)
    private BigDecimal averageYieldPerAcre;

    @Column(name = "average_market_price", precision = 10, scale = 2)
    private BigDecimal averageMarketPrice;
}

package com.farmsetu.model.dto.crop;

import com.farmsetu.model.entity.Crop;
import com.farmsetu.model.enums.CropSeason;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CropResponse {
    private Long id;
    private String name;
    private Map<String, String> localNames;
    private CropSeason season;
    private List<String> soilTypes;
    private String waterRequirement;
    private Integer growingDays;
    private BigDecimal averageYieldPerAcre;
    private BigDecimal averageMarketPrice;

    public static CropResponse from(Crop crop) {
        return CropResponse.builder()
                .id(crop.getId())
                .name(crop.getName())
                .localNames(crop.getLocalNames() != null
                        ? new HashMap<>(crop.getLocalNames())
                        : new HashMap<>())
                .season(crop.getSeason())
                .soilTypes(crop.getSoilTypes() != null
                        ? new ArrayList<>(crop.getSoilTypes())
                        : new ArrayList<>())
                .waterRequirement(crop.getWaterRequirement())
                .growingDays(crop.getGrowingDays())
                .averageYieldPerAcre(crop.getAverageYieldPerAcre())
                .averageMarketPrice(crop.getAverageMarketPrice())
                .build();
    }
}
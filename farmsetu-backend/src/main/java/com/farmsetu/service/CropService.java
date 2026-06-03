package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Crop;
import com.farmsetu.model.enums.CropSeason;
import com.farmsetu.repository.CropRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CropService {

    private final CropRepository cropRepository;

    public List<Crop> getAll() {
        return cropRepository.findAll();
    }

    public Crop getById(Long id) {
        return cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found"));
    }

    public List<Crop> getBySeason(String season) {
        return cropRepository.findBySeason(CropSeason.valueOf(season.toUpperCase()));
    }

    public List<Map<String, Object>> recommend(Map<String, Object> input) {
        return cropRepository.findAll().stream()
                .limit(5)
                .map(c -> Map.<String, Object>of(
                        "cropId", c.getId(),
                        "name", c.getName(),
                        "season", c.getSeason() != null ? c.getSeason().name() : "",
                        "expectedYieldPerAcre", c.getAverageYieldPerAcre(),
                        "expectedProfit", c.getAverageMarketPrice(),
                        "difficulty", "MEDIUM"
                ))
                .toList();
    }
}

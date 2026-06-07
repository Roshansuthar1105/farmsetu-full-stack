package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.DiseaseDetection;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.DiseaseSeverity;
import com.farmsetu.repository.DiseaseDetectionRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DiseaseDetectionService {

    private final DiseaseDetectionRepository diseaseDetectionRepository;
    private final UserRepository userRepository;

    @Transactional
    public DiseaseDetection detect(String cropName, String imageUrl) {
        User farmer = userRepository.getReferenceById(SecurityUtils.currentUserId());
        DiseaseDetection detection = DiseaseDetection.builder()
                .farmer(farmer)
                .cropName(cropName)
                .imageUrl(imageUrl)
                .detectedDisease("Leaf Blight")
                .severity(DiseaseSeverity.MODERATE)
                .confidenceScore(0.87)
                .treatmentSuggestions(Map.of(
                        "organic", "Neem oil spray",
                        "chemical", "Copper-based fungicide",
                        "preventive", "Crop rotation and field sanitation"
                ))
                .build();
        return diseaseDetectionRepository.save(detection);
    }

    public java.util.List<java.util.Map<String, Object>> history(Long farmerId, int page, int size) {
        java.util.List<DiseaseDetection> detections = diseaseDetectionRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId, org.springframework.data.domain.PageRequest.of(page, size));
        return detections.stream().map(d -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", d.getId());
            map.put("cropName", d.getCropName());
            map.put("imageUrl", d.getImageUrl());
            map.put("detectedDisease", d.getDetectedDisease());
            map.put("severity", d.getSeverity() != null ? d.getSeverity().name() : "MODERATE");
            map.put("confidenceScore", d.getConfidenceScore());
            map.put("treatmentSuggestions", d.getTreatmentSuggestions());
            map.put("createdAt", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    public DiseaseDetection getById(Long id) {
        return diseaseDetectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detection not found"));
    }
}

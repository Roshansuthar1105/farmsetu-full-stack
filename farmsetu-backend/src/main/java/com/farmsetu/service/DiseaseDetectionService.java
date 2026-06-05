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
        return diseaseDetectionRepository.findByFarmerIdNative(farmerId, size, page * size);
    }

    public DiseaseDetection getById(Long id) {
        return diseaseDetectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detection not found"));
    }
}

package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.InsuranceScheme;
import com.farmsetu.repository.InsuranceSchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private final InsuranceSchemeRepository insuranceSchemeRepository;

    public java.util.List<InsuranceScheme> getAll() {
        return insuranceSchemeRepository.findAll();
    }

    public InsuranceScheme getById(Long id) {
        return insuranceSchemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance scheme not found"));
    }

    public Map<String, Object> calculatePremium(Map<String, Object> input) {
        BigDecimal area = new BigDecimal(input.getOrDefault("area", "1").toString());
        return Map.of("estimatedPremium", area.multiply(BigDecimal.valueOf(500)));
    }

    public Map<String, Object> fileClaim(Map<String, Object> claim) {
        return Map.of("status", "SUBMITTED", "claim", claim);
    }
}

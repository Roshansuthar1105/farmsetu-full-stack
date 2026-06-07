package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.GovtScheme;
import com.farmsetu.repository.GovtSchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GovtSchemeService {

    private final GovtSchemeRepository govtSchemeRepository;

    public List<GovtScheme> getAll() {
        return govtSchemeRepository.findAll();
    }

    public GovtScheme getById(Long id) {
        return govtSchemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme not found"));
    }

    public List<GovtScheme> getByState(String state) {
        return govtSchemeRepository.findByState(state);
    }

    public Map<String, Object> checkEligibility(Map<String, Object> farmerData) {
        return Map.of("eligibleSchemes", govtSchemeRepository.findAll().stream().limit(3).toList());
    }
}

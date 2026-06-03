package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Mandi;
import com.farmsetu.model.entity.MarketPrice;
import com.farmsetu.repository.MandiRepository;
import com.farmsetu.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MandiService {

    private final MandiRepository mandiRepository;
    private final MarketPriceRepository marketPriceRepository;

    public List<Mandi> nearby(double lat, double lng, double radiusKm) {
        return mandiRepository.findNearby(lat, lng, radiusKm);
    }

    public Mandi getById(Long id) {
        return mandiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mandi not found"));
    }

    public List<MarketPrice> mandiPrices(Long mandiId) {
        Mandi mandi = getById(mandiId);
        return marketPriceRepository.findAll().stream()
                .filter(p -> mandi.getName().equalsIgnoreCase(p.getMandiName()))
                .toList();
    }

    public List<Map<String, Object>> locator(String type, double lat, double lng) {
        return List.of(Map.of("type", type, "lat", lat, "lng", lng, "name", "Sample " + type));
    }
}

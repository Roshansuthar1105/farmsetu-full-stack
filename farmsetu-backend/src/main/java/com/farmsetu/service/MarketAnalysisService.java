package com.farmsetu.service;

import com.farmsetu.model.entity.MarketPrice;
import com.farmsetu.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketAnalysisService {

    private final MarketPriceRepository marketPriceRepository;

    public List<Map<String, Object>> getPrices(int page, int size) {
        return marketPriceRepository.findAllNative(size, page * size);
    }

    public List<Map<String, Object>> getPricesByCrop(Long cropId, int page, int size) {
        return marketPriceRepository.findByCropIdNative(cropId, size, page * size);
    }

    public List<MarketPrice> getTrends(Long cropId) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusMonths(3);
        return marketPriceRepository.findByCropIdAndRecordedDateBetween(cropId, from, to);
    }

    public Map<String, Object> compare(List<Long> cropIds) {
        return Map.of("crops", cropIds, "message", "Compare via Agmarknet integration");
    }

    public Map<String, Object> predict(Long cropId) {
        return Map.of("cropId", cropId, "prediction", "Integrate ML/Agmarknet for forecasts");
    }

    public Map<String, Object> heatmap() {
        return Map.of("regions", List.of(), "message", "Regional heatmap placeholder");
    }

    public Map<String, Object> createAlert(Map<String, Object> alert) {
        return alert;
    }
}

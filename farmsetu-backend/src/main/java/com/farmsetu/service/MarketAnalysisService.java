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
        org.springframework.data.domain.Page<MarketPrice> pageResult = marketPriceRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size));
        return pageResult.getContent().stream().map(mp -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", mp.getId());
            map.put("mandiName", mp.getMandiName());
            map.put("state", mp.getState());
            map.put("district", mp.getDistrict());
            map.put("pricePerQuintal", mp.getPricePerQuintal());
            map.put("minPrice", mp.getMinPrice());
            map.put("maxPrice", mp.getMaxPrice());
            map.put("modalPrice", mp.getModalPrice());
            map.put("tradeVolume", mp.getTradeVolume());
            map.put("recordedDate", mp.getRecordedDate() != null ? mp.getRecordedDate().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    public List<Map<String, Object>> getPricesByCrop(Long cropId, int page, int size) {
        List<MarketPrice> prices = marketPriceRepository.findByCropId(cropId, org.springframework.data.domain.PageRequest.of(page, size));
        return prices.stream().map(mp -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", mp.getId());
            map.put("mandiName", mp.getMandiName());
            map.put("state", mp.getState());
            map.put("district", mp.getDistrict());
            map.put("pricePerQuintal", mp.getPricePerQuintal());
            map.put("minPrice", mp.getMinPrice());
            map.put("maxPrice", mp.getMaxPrice());
            map.put("modalPrice", mp.getModalPrice());
            map.put("tradeVolume", mp.getTradeVolume());
            map.put("recordedDate", mp.getRecordedDate() != null ? mp.getRecordedDate().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());
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

package com.farmsetu.service;

import com.farmsetu.model.entity.MarketPrice;
import com.farmsetu.model.entity.Crop;
import com.farmsetu.model.enums.CropSeason;
import com.farmsetu.repository.MarketPriceRepository;
import com.farmsetu.repository.CropRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketAnalysisService {

    private final MarketPriceRepository marketPriceRepository;
    private final CropRepository cropRepository;

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

    @Transactional
    public MarketPrice createPrice(MarketPrice price) {
        return marketPriceRepository.save(price);
    }

    @Transactional
    public MarketPrice updatePrice(Long id, MarketPrice price) {
        MarketPrice existing = marketPriceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("MarketPrice not found: " + id));
        existing.setMandiName(price.getMandiName());
        existing.setState(price.getState());
        existing.setDistrict(price.getDistrict());
        existing.setPricePerQuintal(price.getPricePerQuintal());
        existing.setMinPrice(price.getMinPrice());
        existing.setMaxPrice(price.getMaxPrice());
        existing.setModalPrice(price.getModalPrice());
        existing.setRecordedDate(price.getRecordedDate());
        existing.setTradeVolume(price.getTradeVolume());
        if (price.getCrop() != null) {
            existing.setCrop(price.getCrop());
        }
        return marketPriceRepository.save(existing);
    }

    @Transactional
    public void deletePrice(Long id) {
        marketPriceRepository.deleteById(id);
    }

    @Transactional
    public List<MarketPrice> importBulkPrices(List<Map<String, String>> rawPrices) {
        java.util.List<MarketPrice> saved = new java.util.ArrayList<>();
        for (Map<String, String> raw : rawPrices) {
            String ticker = raw.get("ticker");
            String market = raw.get("market");
            String maxPrice = raw.get("maxPrice");
            String minPrice = raw.get("minPrice");
            String price = raw.get("price");
            String dateStr = raw.get("date");

            // Look up or create crop
            Crop crop = cropRepository.findByNameIgnoreCase(ticker).orElseGet(() -> {
                CropSeason season = CropSeason.KHARIF;
                String lower = ticker.toLowerCase();
                if (lower.contains("wheat") || lower.contains("mustard") || lower.contains("gram") || lower.contains("potato") || lower.contains("apple")) {
                    season = CropSeason.RABI;
                }
                Crop newCrop = Crop.builder()
                        .name(ticker)
                        .season(season)
                        .growingDays(90)
                        .waterRequirement("MEDIUM")
                        .build();
                return cropRepository.save(newCrop);
            });

            MarketPrice marketPrice = MarketPrice.builder()
                    .crop(crop)
                    .mandiName(market)
                    .state("Punjab")
                    .district("Default")
                    .pricePerQuintal(new BigDecimal(price))
                    .minPrice(new BigDecimal(minPrice))
                    .maxPrice(new BigDecimal(maxPrice))
                    .modalPrice(new BigDecimal(price))
                    .tradeVolume(1500L)
                    .recordedDate(LocalDate.parse(dateStr))
                    .build();

            saved.add(marketPriceRepository.save(marketPrice));
        }
        return saved;
    }
}

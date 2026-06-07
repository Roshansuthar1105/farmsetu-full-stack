package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.MarketPrice;
import com.farmsetu.service.MarketAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketAnalysisController {

    private final MarketAnalysisService marketAnalysisService;

    @GetMapping("/prices")
    public ApiResponse<List<Map<String, Object>>> prices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketAnalysisService.getPrices(page, size));
    }

    @GetMapping("/prices/{cropId}")
    public ApiResponse<List<Map<String, Object>>> pricesByCrop(
            @PathVariable Long cropId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketAnalysisService.getPricesByCrop(cropId, page, size));
    }

    @GetMapping("/trends/{cropId}")
    public ApiResponse<List<MarketPrice>> trends(@PathVariable Long cropId) {
        return ApiResponse.ok(marketAnalysisService.getTrends(cropId));
    }

    @GetMapping("/compare")
    public ApiResponse<Map<String, Object>> compare(@RequestParam List<Long> cropIds) {
        return ApiResponse.ok(marketAnalysisService.compare(cropIds));
    }

    @GetMapping("/prediction/{cropId}")
    public ApiResponse<Map<String, Object>> prediction(@PathVariable Long cropId) {
        return ApiResponse.ok(marketAnalysisService.predict(cropId));
    }

    @GetMapping("/heatmap")
    public ApiResponse<Map<String, Object>> heatmap() {
        return ApiResponse.ok(marketAnalysisService.heatmap());
    }

    @PostMapping("/alerts")
    public ApiResponse<Map<String, Object>> alerts(@RequestBody Map<String, Object> alert) {
        return ApiResponse.ok(marketAnalysisService.createAlert(alert));
    }
}

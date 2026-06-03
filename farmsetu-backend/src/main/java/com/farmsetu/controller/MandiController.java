package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.Mandi;
import com.farmsetu.model.entity.MarketPrice;
import com.farmsetu.service.MandiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MandiController {

    private final MandiService mandiService;

    @GetMapping("/mandis/nearby")
    public ApiResponse<List<Mandi>> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50") double radiusKm) {
        return ApiResponse.ok(mandiService.nearby(lat, lng, radiusKm));
    }

    @GetMapping("/mandis/{id}")
    public ApiResponse<Mandi> get(@PathVariable Long id) {
        return ApiResponse.ok(mandiService.getById(id));
    }

    @GetMapping("/mandis/{id}/prices")
    public ApiResponse<List<MarketPrice>> prices(@PathVariable Long id) {
        return ApiResponse.ok(mandiService.mandiPrices(id));
    }

    @GetMapping("/locator/stores")
    public ApiResponse<List<Map<String, Object>>> stores(
            @RequestParam double lat, @RequestParam double lng) {
        return ApiResponse.ok(mandiService.locator("agro-store", lat, lng));
    }

    @GetMapping("/locator/cold-storage")
    public ApiResponse<List<Map<String, Object>>> coldStorage(
            @RequestParam double lat, @RequestParam double lng) {
        return ApiResponse.ok(mandiService.locator("cold-storage", lat, lng));
    }

    @GetMapping("/locator/transport")
    public ApiResponse<List<Map<String, Object>>> transport(
            @RequestParam double lat, @RequestParam double lng) {
        return ApiResponse.ok(mandiService.locator("transport", lat, lng));
    }

    @GetMapping("/locator/soil-labs")
    public ApiResponse<List<Map<String, Object>>> soilLabs(
            @RequestParam double lat, @RequestParam double lng) {
        return ApiResponse.ok(mandiService.locator("soil-lab", lat, lng));
    }
}

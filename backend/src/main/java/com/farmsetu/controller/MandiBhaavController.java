package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.Commodity;
import com.farmsetu.model.entity.UserWatchlist;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.service.MandiBhaavService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mandi-bhaav")
@RequiredArgsConstructor
public class MandiBhaavController {

    private final MandiBhaavService mandiBhaavService;

    @GetMapping("/commodities")
    public ApiResponse<List<Commodity>> commodities() {
        return ApiResponse.ok(mandiBhaavService.getCommodities());
    }

    @GetMapping("/ticker")
    public ApiResponse<List<Map<String, Object>>> ticker() {
        return ApiResponse.ok(mandiBhaavService.getTickerPrices());
    }

    @GetMapping("/latest")
    public ApiResponse<List<Map<String, Object>>> latestPrices(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm) {
        Long userId = null;
        try {
            userId = SecurityUtils.currentUserId();
        } catch (Exception e) {
            // Unauthenticated request fallback
        }
        return ApiResponse.ok(mandiBhaavService.getLatestPrices(lat, lng, radiusKm, userId));
    }

    @GetMapping("/watchlist")
    public ApiResponse<List<Map<String, Object>>> getWatchlist() {
        return ApiResponse.ok(mandiBhaavService.getWatchlist(SecurityUtils.currentUserId()));
    }

    @PostMapping("/watchlist")
    public ApiResponse<UserWatchlist> addToWatchlist(
            @RequestParam(required = false) Long commodityId,
            @RequestParam(required = false) Long mandiId) {
        return ApiResponse.ok(mandiBhaavService.addToWatchlist(SecurityUtils.currentUserId(), commodityId, mandiId));
    }

    @DeleteMapping("/watchlist/{id}")
    public ApiResponse<Void> removeFromWatchlist(@PathVariable Long id) {
        mandiBhaavService.removeFromWatchlist(SecurityUtils.currentUserId(), id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/compare-roi")
    public ApiResponse<List<Map<String, Object>>> compareRoi(
            @RequestParam Long commodityId,
            @RequestParam double quantity,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        Long userId = null;
        try {
            userId = SecurityUtils.currentUserId();
        } catch (Exception e) {
            // Unauthenticated request fallback
        }
        return ApiResponse.ok(mandiBhaavService.compareRoi(commodityId, quantity, lat, lng, userId));
    }

    @GetMapping("/forecast/{commodityId}")
    public ApiResponse<Map<String, Object>> getForecast(
            @PathVariable Long commodityId,
            @RequestParam(required = false) Integer days) {
        return ApiResponse.ok(mandiBhaavService.getForecast(commodityId, days));
    }

    @PostMapping("/bulk")
    public ApiResponse<List<com.farmsetu.model.entity.DailyPrice>> importBulkDailyPrices(@RequestBody List<Map<String, String>> rawList) {
        return ApiResponse.ok(mandiBhaavService.importBulkDailyPrices(rawList));
    }

    @DeleteMapping("/batch")
    public ApiResponse<Void> deleteDailyPricesBatch(@RequestBody List<Long> ids) {
        mandiBhaavService.deleteDailyPricesBatch(ids);
        return ApiResponse.ok(null);
    }
}

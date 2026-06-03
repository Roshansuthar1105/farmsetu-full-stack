package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.FarmerProfile;
import com.farmsetu.service.FarmDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class FarmDashboardController {

    private final FarmDashboardService farmDashboardService;

    @GetMapping("/{farmerId}")
    public ApiResponse<Map<String, Object>> dashboard(@PathVariable Long farmerId) {
        return ApiResponse.ok(farmDashboardService.getDashboard(farmerId));
    }

    @GetMapping("/analytics/{farmerId}")
    public ApiResponse<Map<String, Object>> analytics(@PathVariable Long farmerId) {
        return ApiResponse.ok(farmDashboardService.getAnalytics(farmerId));
    }

    @PostMapping("/farm-details")
    public ApiResponse<FarmerProfile> createFarmDetails(@RequestBody FarmerProfile profile) {
        return ApiResponse.ok(farmDashboardService.saveFarmDetails(profile.getUser().getId(), profile));
    }

    @PutMapping("/farm-details/{id}")
    public ApiResponse<FarmerProfile> updateFarmDetails(@PathVariable Long id, @RequestBody FarmerProfile profile) {
        return ApiResponse.ok(farmDashboardService.saveFarmDetails(id, profile));
    }
}

package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.InsuranceScheme;
import com.farmsetu.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceService insuranceService;

    @GetMapping
    public ApiResponse<List<InsuranceScheme>> list() {
        return ApiResponse.ok(insuranceService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<InsuranceScheme> get(@PathVariable Long id) {
        return ApiResponse.ok(insuranceService.getById(id));
    }

    @PostMapping("/premium-calculate")
    public ApiResponse<Map<String, Object>> premium(@RequestBody Map<String, Object> input) {
        return ApiResponse.ok(insuranceService.calculatePremium(input));
    }

    @PostMapping("/claim")
    public ApiResponse<Map<String, Object>> claim(@RequestBody Map<String, Object> claim) {
        return ApiResponse.ok(insuranceService.fileClaim(claim));
    }
}

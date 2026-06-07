package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.GovtScheme;
import com.farmsetu.service.GovtSchemeService;
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
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class GovtSchemeController {

    private final GovtSchemeService govtSchemeService;

    @GetMapping
    public ApiResponse<List<GovtScheme>> list() {
        return ApiResponse.ok(govtSchemeService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<GovtScheme> get(@PathVariable Long id) {
        return ApiResponse.ok(govtSchemeService.getById(id));
    }

    @PostMapping("/eligibility-check")
    public ApiResponse<Map<String, Object>> eligibility(@RequestBody Map<String, Object> data) {
        return ApiResponse.ok(govtSchemeService.checkEligibility(data));
    }

    @GetMapping("/state/{state}")
    public ApiResponse<List<GovtScheme>> byState(@PathVariable String state) {
        return ApiResponse.ok(govtSchemeService.getByState(state));
    }
}

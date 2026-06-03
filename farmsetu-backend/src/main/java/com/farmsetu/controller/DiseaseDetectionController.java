package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.common.PageResponse;
import com.farmsetu.model.entity.DiseaseDetection;
import com.farmsetu.service.DiseaseDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/disease")
@RequiredArgsConstructor
public class DiseaseDetectionController {

    private final DiseaseDetectionService diseaseDetectionService;

    @PostMapping("/detect")
    public ApiResponse<DiseaseDetection> detect(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(diseaseDetectionService.detect(body.get("cropName"), body.get("imageUrl")));
    }

    @GetMapping("/history/{farmerId}")
    public ApiResponse<PageResponse<DiseaseDetection>> history(
            @PathVariable Long farmerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(diseaseDetectionService.history(farmerId, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<DiseaseDetection> get(@PathVariable Long id) {
        return ApiResponse.ok(diseaseDetectionService.getById(id));
    }
}

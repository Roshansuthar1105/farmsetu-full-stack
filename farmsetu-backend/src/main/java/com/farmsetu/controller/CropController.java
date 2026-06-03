package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.Crop;
import com.farmsetu.service.CropService;
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
@RequestMapping("/api/crops")
@RequiredArgsConstructor
public class CropController {

    private final CropService cropService;

    @PostMapping("/recommend")
    public ApiResponse<List<Map<String, Object>>> recommend(@RequestBody Map<String, Object> input) {
        return ApiResponse.ok(cropService.recommend(input));
    }

    @GetMapping
    public ApiResponse<List<Crop>> list() {
        return ApiResponse.ok(cropService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Crop> get(@PathVariable Long id) {
        return ApiResponse.ok(cropService.getById(id));
    }

    @GetMapping("/season/{season}")
    public ApiResponse<List<Crop>> bySeason(@PathVariable String season) {
        return ApiResponse.ok(cropService.getBySeason(season));
    }
}

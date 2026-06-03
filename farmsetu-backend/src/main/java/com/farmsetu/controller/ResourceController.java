package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.common.PageResponse;
import com.farmsetu.model.entity.Resource;
import com.farmsetu.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ApiResponse<PageResponse<Resource>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(resourceService.list(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<Resource> get(@PathVariable Long id) {
        return ApiResponse.ok(resourceService.getById(id));
    }

    @PostMapping
    public ApiResponse<Resource> create(@RequestBody Resource resource) {
        return ApiResponse.ok(resourceService.create(resource));
    }

    @PutMapping("/{id}/progress")
    public ApiResponse<Void> progress(@PathVariable Long id) {
        resourceService.markProgress(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/completed")
    public ApiResponse<List<Resource>> completed() {
        return ApiResponse.ok(resourceService.completed());
    }
}

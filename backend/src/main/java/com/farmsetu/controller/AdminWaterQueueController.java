package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.WaterSource;
import com.farmsetu.service.WaterQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/water-queue")
@RequiredArgsConstructor
public class AdminWaterQueueController {

    private final WaterQueueService waterQueueService;

    @GetMapping("/bookings")
    public ApiResponse<List<Map<String, Object>>> allBookings() {
        return ApiResponse.ok(waterQueueService.getAllBookingsForAdmin());
    }

    @PutMapping("/bookings/{id}/status")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ApiResponse.ok(waterQueueService.updateBookingStatus(id, status));
    }

    @GetMapping("/sources")
    public ApiResponse<List<WaterSource>> adminSources() {
        return ApiResponse.ok(waterQueueService.getAdminSources());
    }

    @PostMapping("/sources")
    public ApiResponse<WaterSource> createSource(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(waterQueueService.addSource(body));
    }

    @PutMapping("/sources/{id}")
    public ApiResponse<WaterSource> updateSource(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(waterQueueService.updateSource(id, body));
    }

    @DeleteMapping("/sources/{id}")
    public ApiResponse<Void> deleteSource(@PathVariable Long id) {
        waterQueueService.deleteSource(id);
        return ApiResponse.ok(null);
    }
}

package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.WaterSource;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.service.WaterQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-queue")
@RequiredArgsConstructor
public class WaterQueueController {

    private final WaterQueueService waterQueueService;

    @GetMapping("/sources")
    public ApiResponse<List<WaterSource>> listSources() {
        return ApiResponse.ok(waterQueueService.getAllSources());
    }

    @GetMapping("/bookings")
    public ApiResponse<List<Map<String, Object>>> userBookings() {
        return ApiResponse.ok(waterQueueService.getUserBookings(SecurityUtils.currentUserId()));
    }

    @PostMapping("/bookings/check")
    public ApiResponse<Map<String, Object>> checkBooking(
            @RequestBody Map<String, Object> body) {
        Long sourceId = Long.valueOf(body.get("waterSourceId").toString());
        Double hours = Double.valueOf(body.get("hoursRequested").toString());
        LocalDate date = LocalDate.parse((CharSequence) body.get("bookingDate"));

        return ApiResponse.ok(waterQueueService.checkRainIntervention(
                SecurityUtils.currentUserId(), sourceId, hours, date));
    }

    @PostMapping("/bookings")
    public ApiResponse<Map<String, Object>> requestSlot(
            @RequestBody Map<String, Object> body) {
        Long sourceId = Long.valueOf(body.get("waterSourceId").toString());
        Double hours = Double.valueOf(body.get("hoursRequested").toString());
        LocalDate date = LocalDate.parse((CharSequence) body.get("bookingDate"));
        String notes = (String) body.get("notes");
        String preferredTime = (String) body.get("preferredTime");
        Boolean bypassWarning = (Boolean) body.get("bypassWarning");

        return ApiResponse.ok(waterQueueService.createBooking(
                SecurityUtils.currentUserId(), sourceId, hours, date, notes, preferredTime, bypassWarning));
    }

    @GetMapping("/bookings/queue")
    public ApiResponse<List<Map<String, Object>>> queueTimeline(
            @RequestParam Long waterSourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(waterQueueService.getQueueForSourceAndDate(waterSourceId, date));
    }

    @PutMapping("/bookings/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelBooking(@PathVariable Long id) {
        return ApiResponse.ok(waterQueueService.cancelBooking(id, SecurityUtils.currentUserId()));
    }
}

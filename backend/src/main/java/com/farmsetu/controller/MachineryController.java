package com.farmsetu.controller;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.service.MachineryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/machinery")
@RequiredArgsConstructor
public class MachineryController {

    private final MachineryService machineryService;

    // ─── Equipment Listings ──────────────────────────────────────────────

    @PostMapping("/equipment")
    public ApiResponse<Map<String, Object>> addEquipment(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok("Equipment listed successfully",
                machineryService.addEquipment(SecurityUtils.currentUserId(), body));
    }

    @GetMapping("/equipment/my")
    public ApiResponse<List<Map<String, Object>>> getMyEquipment() {
        return ApiResponse.ok(machineryService.getMyEquipment(SecurityUtils.currentUserId()));
    }

    @PutMapping("/equipment/{id}")
    public ApiResponse<Map<String, Object>> updateEquipment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok("Equipment listing updated successfully",
                machineryService.updateEquipment(id, SecurityUtils.currentUserId(), body));
    }

    @PutMapping("/equipment/{id}/toggle")
    public ApiResponse<Map<String, Object>> toggleActive(@PathVariable Long id) {
        return ApiResponse.ok("Equipment status updated",
                machineryService.toggleActive(id, SecurityUtils.currentUserId()));
    }

    @GetMapping("/equipment/nearby")
    public ApiResponse<List<Map<String, Object>>> findNearby(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10.0") Double radius,
            @RequestParam(required = false) String category) {
        return ApiResponse.ok(machineryService.findNearby(lat, lng, radius, category));
    }

    @GetMapping("/equipment/{id}")
    public ApiResponse<Map<String, Object>> getEquipmentDetail(@PathVariable Long id) {
        return ApiResponse.ok(machineryService.getEquipmentDetail(id));
    }

    @PostMapping("/equipment/{id}/calculate-cost")
    public ApiResponse<Map<String, Object>> calculateCost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (!body.containsKey("startTime") || !body.containsKey("endTime")) {
            throw new BadRequestException("startTime and endTime are required");
        }
        LocalDateTime start = parseDateTime(body.get("startTime"));
        LocalDateTime end = parseDateTime(body.get("endTime"));
        Double cost = machineryService.calculateCost(id, start, end);
        return ApiResponse.ok(Map.of("totalCost", cost));
    }

    // ─── Bookings ────────────────────────────────────────────────────────

    @PostMapping("/bookings")
    public ApiResponse<Map<String, Object>> requestBooking(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("equipmentId") || !body.containsKey("startTime") || !body.containsKey("endTime")) {
            throw new BadRequestException("equipmentId, startTime, and endTime are required");
        }
        Long equipmentId = Long.valueOf(body.get("equipmentId").toString());
        LocalDateTime start = parseDateTime(body.get("startTime").toString());
        LocalDateTime end = parseDateTime(body.get("endTime").toString());
        String notes = (String) body.get("notes");

        return ApiResponse.ok("Booking request submitted successfully",
                machineryService.requestBooking(SecurityUtils.currentUserId(), equipmentId, start, end, notes));
    }

    @GetMapping("/bookings/my")
    public ApiResponse<List<Map<String, Object>>> getMyBookings() {
        return ApiResponse.ok(machineryService.getMyBookings(SecurityUtils.currentUserId()));
    }

    @GetMapping("/bookings/incoming")
    public ApiResponse<List<Map<String, Object>>> getIncomingRequests() {
        return ApiResponse.ok(machineryService.getIncomingRequests(SecurityUtils.currentUserId()));
    }

    @PutMapping("/bookings/{id}/approve")
    public ApiResponse<Map<String, Object>> approveBooking(@PathVariable Long id) {
        return ApiResponse.ok("Booking request approved",
                machineryService.approveBooking(id, SecurityUtils.currentUserId()));
    }

    @PutMapping("/bookings/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectBooking(@PathVariable Long id) {
        return ApiResponse.ok("Booking request rejected",
                machineryService.rejectBooking(id, SecurityUtils.currentUserId()));
    }

    @PutMapping("/bookings/{id}/complete")
    public ApiResponse<Map<String, Object>> completeBooking(@PathVariable Long id) {
        return ApiResponse.ok("Rental marked as completed",
                machineryService.completeBooking(id, SecurityUtils.currentUserId()));
    }

    // ─── Date-Time Parser Helper ────────────────────────────────────────

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank()) {
            throw new BadRequestException("Date-time string cannot be empty");
        }
        try {
            // Trim whitespace
            dateTimeStr = dateTimeStr.trim();
            if (dateTimeStr.endsWith("Z")) {
                return OffsetDateTime.parse(dateTimeStr).toLocalDateTime();
            }
            if (dateTimeStr.contains("+") || (dateTimeStr.lastIndexOf("-") > 10)) {
                try {
                    return OffsetDateTime.parse(dateTimeStr).toLocalDateTime();
                } catch (Exception ex) {
                    // fall back
                }
            }
            return LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date-time format: " + dateTimeStr);
        }
    }
}

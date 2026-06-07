package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("")
    public ApiResponse<Map<String, Object>> weather(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        Double targetLat = lat != null ? lat : 28.6139;
        Double targetLon = lon != null ? lon : 77.209;
        return ApiResponse.ok(Map.of(
            "current", weatherService.current(targetLat, targetLon, null),
            "forecast", weatherService.forecast(targetLat, targetLon, 7)
        ));
    }

    @GetMapping("/current")
    public ApiResponse<Map<String, Object>> current(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String city) {
        return ApiResponse.ok(weatherService.current(lat, lng, city));
    }

    @GetMapping("/forecast")
    public ApiResponse<List<Map<String, Object>>> forecast(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "7") int days) {
        return ApiResponse.ok(weatherService.forecast(lat, lng, days));
    }

    @GetMapping("/alerts")
    public ApiResponse<List<Map<String, Object>>> alerts(@RequestParam(required = false) String state) {
        return ApiResponse.ok(weatherService.alerts(state));
    }

    @GetMapping("/history")
    public ApiResponse<List<Map<String, Object>>> history(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ApiResponse.ok(weatherService.history(lat, lng));
    }
}

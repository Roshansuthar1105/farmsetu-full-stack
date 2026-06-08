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
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String city) {
        Double targetLat = lat;
        Double targetLon = lon;
        String resolvedCity = city;

        if (city != null && !city.trim().isEmpty()) {
            Map<String, Object> coords = weatherService.resolveCity(city);
            if (coords != null) {
                targetLat = (Double) coords.get("lat");
                targetLon = (Double) coords.get("lng");
                resolvedCity = (String) coords.get("city");
            } else {
                resolvedCity = city + " (Location Not Found)";
            }
        }

        if (targetLat == null) targetLat = 28.6139;
        if (targetLon == null) targetLon = 77.209;

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("current", weatherService.current(targetLat, targetLon, resolvedCity));
        result.put("forecast", weatherService.forecast(targetLat, targetLon, 7));
        return ApiResponse.ok(result);
    }

    @GetMapping("/current")
    public ApiResponse<Map<String, Object>> current(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String city) {
        Double targetLat = lat;
        Double targetLng = lng;
        String resolvedCity = city;

        if (city != null && !city.trim().isEmpty()) {
            Map<String, Object> coords = weatherService.resolveCity(city);
            if (coords != null) {
                targetLat = (Double) coords.get("lat");
                targetLng = (Double) coords.get("lng");
                resolvedCity = (String) coords.get("city");
            } else {
                resolvedCity = city + " (Location Not Found)";
            }
        }

        if (targetLat == null) targetLat = 28.6139;
        if (targetLng == null) targetLng = 77.209;

        return ApiResponse.ok(weatherService.current(targetLat, targetLng, resolvedCity));
    }

    @GetMapping("/forecast")
    public ApiResponse<List<Map<String, Object>>> forecast(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "7") int days) {
        Double targetLat = lat;
        Double targetLng = lng;

        if (city != null && !city.trim().isEmpty()) {
            Map<String, Object> coords = weatherService.resolveCity(city);
            if (coords != null) {
                targetLat = (Double) coords.get("lat");
                targetLng = (Double) coords.get("lng");
            }
        }

        if (targetLat == null) targetLat = 28.6139;
        if (targetLng == null) targetLng = 77.209;

        return ApiResponse.ok(weatherService.forecast(targetLat, targetLng, days));
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

package com.farmsetu.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    public Map<String, Object> current(Double lat, Double lng, String city) {
        return Map.of("source", "OpenWeatherMap", "lat", lat, "lng", lng, "city", city,
                "temp", 28, "humidity", 65, "description", "Partly cloudy");
    }

    public List<Map<String, Object>> forecast(Double lat, Double lng, int days) {
        return List.of(Map.of("day", 1, "tempMax", 32, "tempMin", 22, "rainMm", 2.5));
    }

    public List<Map<String, Object>> alerts(String state) {
        return List.of(Map.of("type", "HEATWAVE", "severity", "MODERATE", "state", state));
    }

    public List<Map<String, Object>> history(Double lat, Double lng) {
        return List.of();
    }
}

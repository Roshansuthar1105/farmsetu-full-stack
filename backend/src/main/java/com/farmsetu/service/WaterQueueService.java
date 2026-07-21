package com.farmsetu.service;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.entity.WaterBooking;
import com.farmsetu.model.entity.WaterSource;
import com.farmsetu.model.enums.NotificationType;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.repository.WaterBookingRepository;
import com.farmsetu.repository.WaterSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaterQueueService {

    private final WaterSourceRepository waterSourceRepository;
    private final WaterBookingRepository waterBookingRepository;
    private final UserRepository userRepository;
    private final WeatherService weatherService;
    private final NotificationService notificationService;

    public List<WaterSource> getAllSources() {
        return waterSourceRepository.findByStatus("ACTIVE");
    }

    public List<WaterSource> getAdminSources() {
        return waterSourceRepository.findAll();
    }

    @Transactional
    public WaterSource addSource(Map<String, Object> body) {
        String name = (String) body.get("name");
        String type = (String) body.get("type");
        String location = (String) body.get("location");
        Double lat = body.get("latitude") != null ? Double.valueOf(body.get("latitude").toString()) : null;
        Double lng = body.get("longitude") != null ? Double.valueOf(body.get("longitude").toString()) : null;
        Double flowRateLph = body.get("flowRateLph") != null ? Double.valueOf(body.get("flowRateLph").toString()) : null;

        if (name == null || type == null) {
            throw new BadRequestException("Name and Type are required fields");
        }

        WaterSource ws = WaterSource.builder()
                .name(name)
                .type(type)
                .location(location)
                .latitude(lat)
                .longitude(lng)
                .flowRateLph(flowRateLph != null ? flowRateLph : 15000.0)
                .status("ACTIVE")
                .build();
        return waterSourceRepository.save(ws);
    }

    @Transactional
    public WaterSource updateSource(Long id, Map<String, Object> body) {
        WaterSource ws = waterSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Water Source not found"));

        if (body.containsKey("name")) ws.setName((String) body.get("name"));
        if (body.containsKey("type")) ws.setType((String) body.get("type"));
        if (body.containsKey("location")) ws.setLocation((String) body.get("location"));
        if (body.containsKey("status")) ws.setStatus((String) body.get("status"));
        if (body.containsKey("latitude")) ws.setLatitude(body.get("latitude") != null ? Double.valueOf(body.get("latitude").toString()) : null);
        if (body.containsKey("longitude")) ws.setLongitude(body.get("longitude") != null ? Double.valueOf(body.get("longitude").toString()) : null);
        if (body.containsKey("flowRateLph")) ws.setFlowRateLph(body.get("flowRateLph") != null ? Double.valueOf(body.get("flowRateLph").toString()) : null);

        return waterSourceRepository.save(ws);
    }

    @Transactional
    public void deleteSource(Long id) {
        waterSourceRepository.deleteById(id);
    }

    @Transactional
    public List<WaterSource> addSourcesBulk(List<Map<String, Object>> list) {
        if (list == null || list.isEmpty()) return List.of();
        List<WaterSource> result = new java.util.ArrayList<>();
        for (Map<String, Object> body : list) {
            result.add(addSource(body));
        }
        return result;
    }

    @Transactional
    public void deleteSourcesBatch(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            waterSourceRepository.deleteAllByIdInBatch(ids);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserBookings(Long userId) {
        return waterBookingRepository.findByFarmerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllBookingsForAdmin() {
        return waterBookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQueueForSourceAndDate(Long waterSourceId, LocalDate date) {
        return waterBookingRepository.findByWaterSourceIdAndBookingDateAndStatusOrderByQueuePositionAsc(waterSourceId, date, "APPROVED")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> checkRainIntervention(Long userId, Long sourceId, Double hours, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Double lat = user.getLatitude();
        Double lng = user.getLongitude();

        // If user coordinates are missing, fallback to water source or default Jaipur coordinates
        if (lat == null || lng == null) {
            WaterSource source = waterSourceRepository.findById(sourceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Water source not found"));
            lat = source.getLatitude() != null ? source.getLatitude() : 26.8809;
            lng = source.getLongitude() != null ? source.getLongitude() : 75.7590;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("hasWarning", false);
        result.put("rainMm", 0.0);
        result.put("rainChance", 0.0);
        result.put("warningMessage", "");

        // Find how many days between now and the booking date
        long daysDiff = ChronoUnit.DAYS.between(LocalDate.now(), date);
        if (daysDiff < 0 || daysDiff > 7) {
            return result; // Out of weather forecast range
        }

        List<Map<String, Object>> forecastList = weatherService.forecast(lat, lng, 7);
        for (Map<String, Object> dayForecast : forecastList) {
            String fDateStr = (String) dayForecast.get("date");
            if (fDateStr != null && fDateStr.equals(date.toString())) {
                Number rainNumber = (Number) dayForecast.get("rainMm");
                double rainMm = rainNumber != null ? rainNumber.doubleValue() : 0.0;

                if (rainMm > 1.0) {
                    double rainChance = Math.min(95.0, 50.0 + (rainMm * 10.0));
                    result.put("hasWarning", true);
                    result.put("rainMm", rainMm);
                    result.put("rainChance", Math.round(rainChance * 10.0) / 10.0);

                    List<String> crops = user.getCurrentCrops();
                    String cropMsg = crops == null || crops.isEmpty() ? "crops" : String.join(", ", crops);

                    String warningMsg = String.format(
                            "AI Predicts %.0f%% chance of rain (%.1fmm) on %s. Overwatering + Rain will cause root rot in your %s. We recommend scheduling for a dry day instead or reducing to 1 hour.",
                            rainChance, rainMm, date.toString(), cropMsg
                    );
                    result.put("warningMessage", warningMsg);
                }
                break;
            }
        }

        return result;
    }

    @Transactional
    public Map<String, Object> createBooking(Long userId, Long sourceId, Double hours, LocalDate date, String notes, String preferredTime, Boolean bypassWarning) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        WaterSource source = waterSourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Water source not found"));

        if (hours <= 0) {
            throw new BadRequestException("Duration must be positive");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past");
        }

        Map<String, Object> weatherCheck = checkRainIntervention(userId, sourceId, hours, date);
        boolean hasWarning = (boolean) weatherCheck.get("hasWarning");

        if (hasWarning && !Boolean.TRUE.equals(bypassWarning)) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "WARNING");
            response.put("warning", weatherCheck);
            return response;
        }

        Double flowRate = source.getFlowRateLph() != null ? source.getFlowRateLph() : 15000.0;
        Double suppliedWater = flowRate * hours;

        WaterBooking booking = WaterBooking.builder()
                .farmer(user)
                .waterSource(source)
                .hoursRequested(hours)
                .bookingDate(date)
                .status("PENDING")
                .weatherWarning(hasWarning)
                .weatherRainChance(hasWarning ? (Double) weatherCheck.get("rainChance") : null)
                .preferredTime(preferredTime)
                .waterSuppliedLiters(suppliedWater)
                .notes(notes)
                .build();

        WaterBooking saved = waterBookingRepository.save(booking);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("booking", mapToResponse(saved));

        // Create Admin Notification
        log.info("New water booking requested by user {} for source {}", userId, sourceId);

        return response;
    }

    @Transactional
    public Map<String, Object> updateBookingStatus(Long id, String status) {
        WaterBooking booking = waterBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Water Booking not found"));

        String oldStatus = booking.getStatus();

        if ("APPROVED".equalsIgnoreCase(status)) {
            // Find current approved bookings for this source and date *before* setting this to approved
            List<WaterBooking> approved = waterBookingRepository.findByWaterSourceIdAndBookingDateAndStatusOrderByQueuePositionAsc(
                    booking.getWaterSource().getId(), booking.getBookingDate(), "APPROVED"
            ).stream()
             .filter(b -> !b.getId().equals(id))
             .collect(Collectors.toList());

            int maxPos = approved.stream()
                    .map(WaterBooking::getQueuePosition)
                    .filter(pos -> pos != null)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);

            booking.setStatus("APPROVED");
            booking.setQueuePosition(maxPos + 1);

            LocalDateTime startTime = booking.getBookingDate().atTime(8, 0);
            if (!approved.isEmpty()) {
                WaterBooking last = approved.get(approved.size() - 1);
                startTime = last.getScheduledStartTime().plusMinutes((long) (last.getHoursRequested() * 60));
            } else if (booking.getBookingDate().equals(LocalDate.now())) {
                LocalDateTime now = LocalDateTime.now();
                if (now.isAfter(startTime)) {
                    startTime = now;
                }
            }
            booking.setScheduledStartTime(startTime);
            waterBookingRepository.save(booking);

            String timeStr = startTime.format(DateTimeFormatter.ofPattern("hh:mm a"));
            notificationService.create(
                    booking.getFarmer().getId(),
                    "Water Slot Approved",
                    "Your slot for " + booking.getWaterSource().getName() + " is approved! Queue: " + booking.getQueuePosition() + ", Est. Start: " + timeStr,
                    NotificationType.GENERAL,
                    "/app/water-queue"
            );
        } else if ("COMPLETED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status)) {
            booking.setStatus(status.toUpperCase());
            booking.setQueuePosition(null);
            booking.setScheduledStartTime(null);
            waterBookingRepository.save(booking);

            // Notify User
            notificationService.create(
                    booking.getFarmer().getId(),
                    "Water Slot " + status.toUpperCase(),
                    "Your booking for " + booking.getWaterSource().getName() + " is now " + status.toUpperCase(),
                    NotificationType.GENERAL,
                    "/app/water-queue"
            );

            // If it was APPROVED previously, we need to shift subsequent bookings
            if ("APPROVED".equalsIgnoreCase(oldStatus)) {
                recalculateQueueTimes(booking.getWaterSource().getId(), booking.getBookingDate());
            }
        } else {
            booking.setStatus(status.toUpperCase());
            waterBookingRepository.save(booking);
        }

        return mapToResponse(booking);
    }

    @Transactional
    public Map<String, Object> cancelBooking(Long id, Long userId) {
        WaterBooking booking = waterBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Water Booking not found"));

        if (!booking.getFarmer().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        return updateBookingStatus(id, "CANCELLED");
    }

    private void recalculateQueueTimes(Long waterSourceId, LocalDate date) {
        List<WaterBooking> approved = waterBookingRepository.findByWaterSourceIdAndBookingDateAndStatusOrderByQueuePositionAsc(
                waterSourceId, date, "APPROVED"
        );
        if (approved.isEmpty()) {
            return;
        }

        LocalDateTime nextStart = date.atTime(8, 0);
        if (date.equals(LocalDate.now())) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(nextStart)) {
                nextStart = now;
            }
        }

        for (int i = 0; i < approved.size(); i++) {
            WaterBooking b = approved.get(i);
            b.setQueuePosition(i + 1);
            b.setScheduledStartTime(nextStart);
            waterBookingRepository.save(b);

            String timeStr = nextStart.format(DateTimeFormatter.ofPattern("hh:mm a"));
            if (i == 0) {
                notificationService.create(
                        b.getFarmer().getId(),
                        "Next in Line for Water",
                        "You are now first in line for " + b.getWaterSource().getName() + ". Start time: " + timeStr,
                        NotificationType.GENERAL,
                        "/app/water-queue"
                );
            } else {
                notificationService.create(
                        b.getFarmer().getId(),
                        "Water Queue Position Updated",
                        "New position: " + (i + 1) + " for " + b.getWaterSource().getName() + ". Est. Start: " + timeStr,
                        NotificationType.GENERAL,
                        "/app/water-queue"
                );
            }

            nextStart = nextStart.plusMinutes((long) (b.getHoursRequested() * 60));
        }
    }

    public Map<String, Object> mapToResponse(WaterBooking booking) {
        if (booking == null) return null;
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("farmerId", booking.getFarmer().getId());
        map.put("farmerName", booking.getFarmer().getName());
        map.put("waterSourceId", booking.getWaterSource().getId());
        map.put("waterSourceName", booking.getWaterSource().getName());
        map.put("waterSourceType", booking.getWaterSource().getType());
        map.put("waterSourceFlowRateLph", booking.getWaterSource().getFlowRateLph());
        map.put("hoursRequested", booking.getHoursRequested());
        map.put("bookingDate", booking.getBookingDate().toString());
        map.put("status", booking.getStatus());
        map.put("queuePosition", booking.getQueuePosition());
        map.put("scheduledStartTime", booking.getScheduledStartTime() != null ? booking.getScheduledStartTime().toString() : null);
        map.put("weatherWarning", booking.getWeatherWarning());
        map.put("weatherRainChance", booking.getWeatherRainChance());
        map.put("preferredTime", booking.getPreferredTime());
        map.put("waterSuppliedLiters", booking.getWaterSuppliedLiters());
        map.put("notes", booking.getNotes());
        map.put("createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null);
        return map;
    }
}

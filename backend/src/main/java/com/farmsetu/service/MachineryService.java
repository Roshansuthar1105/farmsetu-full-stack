package com.farmsetu.service;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Equipment;
import com.farmsetu.model.entity.EquipmentBooking;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.BookingStatus;
import com.farmsetu.model.enums.EquipmentCategory;
import com.farmsetu.model.enums.NotificationType;
import com.farmsetu.repository.EquipmentBookingRepository;
import com.farmsetu.repository.EquipmentRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MachineryService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentBookingRepository equipmentBookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ─── Equipment CRUD ──────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> addEquipment(Long userId, Map<String, Object> body) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String name = (String) body.get("name");
        String categoryStr = (String) body.get("category");
        String description = (String) body.get("description");
        Double hourlyRate = body.get("hourlyRate") != null ? Double.valueOf(body.get("hourlyRate").toString()) : null;
        Double dailyRate = body.get("dailyRate") != null ? Double.valueOf(body.get("dailyRate").toString()) : null;
        String imageUrl = (String) body.get("imageUrl");
        Double locationLat = body.get("locationLat") != null ? Double.valueOf(body.get("locationLat").toString()) : null;
        Double locationLng = body.get("locationLng") != null ? Double.valueOf(body.get("locationLng").toString()) : null;
        String village = (String) body.get("village");

        if (name == null || name.isBlank()) {
            throw new BadRequestException("Equipment name is required");
        }
        if (categoryStr == null || categoryStr.isBlank()) {
            throw new BadRequestException("Equipment category is required");
        }
        if (hourlyRate == null || hourlyRate <= 0) {
            throw new BadRequestException("Hourly rate must be greater than zero");
        }
        if (dailyRate == null || dailyRate <= 0) {
            throw new BadRequestException("Daily rate must be greater than zero");
        }

        EquipmentCategory category;
        try {
            category = EquipmentCategory.valueOf(categoryStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid category: " + categoryStr);
        }

        // Fallback to user location if not explicitly provided
        if (locationLat == null) {
            locationLat = owner.getLatitude();
        }
        if (locationLng == null) {
            locationLng = owner.getLongitude();
        }
        if (village == null || village.isBlank()) {
            village = owner.getVillage();
        }

        Equipment equipment = Equipment.builder()
                .owner(owner)
                .name(name)
                .category(category)
                .description(description)
                .hourlyRate(hourlyRate)
                .dailyRate(dailyRate)
                .imageUrl(imageUrl)
                .locationLat(locationLat)
                .locationLng(locationLng)
                .village(village)
                .isActive(true)
                .build();

        Equipment saved = equipmentRepository.save(equipment);
        log.info("Equipment '{}' listed by user {}", name, userId);
        return mapEquipmentToResponse(saved, null);
    }

    @Transactional
    public Map<String, Object> updateEquipment(Long equipmentId, Long userId, Map<String, Object> body) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        if (!equipment.getOwner().getId().equals(userId)) {
            throw new BadRequestException("You are not the owner of this equipment");
        }

        String name = (String) body.get("name");
        String categoryStr = (String) body.get("category");
        String description = (String) body.get("description");
        Double hourlyRate = body.get("hourlyRate") != null ? Double.valueOf(body.get("hourlyRate").toString()) : null;
        Double dailyRate = body.get("dailyRate") != null ? Double.valueOf(body.get("dailyRate").toString()) : null;
        String imageUrl = (String) body.get("imageUrl");
        Double locationLat = body.get("locationLat") != null ? Double.valueOf(body.get("locationLat").toString()) : null;
        Double locationLng = body.get("locationLng") != null ? Double.valueOf(body.get("locationLng").toString()) : null;
        String village = (String) body.get("village");

        if (name == null || name.isBlank()) {
            throw new BadRequestException("Equipment name is required");
        }
        if (categoryStr == null || categoryStr.isBlank()) {
            throw new BadRequestException("Equipment category is required");
        }
        if (hourlyRate == null || hourlyRate <= 0) {
            throw new BadRequestException("Hourly rate must be greater than zero");
        }
        if (dailyRate == null || dailyRate <= 0) {
            throw new BadRequestException("Daily rate must be greater than zero");
        }

        EquipmentCategory category;
        try {
            category = EquipmentCategory.valueOf(categoryStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid category: " + categoryStr);
        }

        equipment.setName(name);
        equipment.setCategory(category);
        equipment.setDescription(description);
        equipment.setHourlyRate(hourlyRate);
        equipment.setDailyRate(dailyRate);
        equipment.setImageUrl(imageUrl);
        equipment.setLocationLat(locationLat);
        equipment.setLocationLng(locationLng);
        equipment.setVillage(village);

        Equipment saved = equipmentRepository.save(equipment);
        log.info("Equipment '{}' updated by user {}", name, userId);
        return mapEquipmentToResponse(saved, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyEquipment(Long userId) {
        return equipmentRepository.findByOwnerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(eq -> mapEquipmentToResponse(eq, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEquipmentDetail(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        return mapEquipmentToResponse(equipment, null);
    }

    @Transactional
    public Map<String, Object> toggleActive(Long equipmentId, Long userId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        if (!equipment.getOwner().getId().equals(userId)) {
            throw new BadRequestException("You are not the owner of this equipment");
        }

        equipment.setIsActive(!equipment.getIsActive());
        Equipment saved = equipmentRepository.save(equipment);
        log.info("Equipment '{}' active status toggled to {}", equipment.getName(), equipment.getIsActive());
        return mapEquipmentToResponse(saved, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findNearby(Double userLat, Double userLng, Double radiusKm, String categoryStr) {
        List<Equipment> allActive;
        if (categoryStr != null && !categoryStr.isBlank() && !"ALL".equalsIgnoreCase(categoryStr)) {
            EquipmentCategory category;
            try {
                category = EquipmentCategory.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid category: " + categoryStr);
            }
            allActive = equipmentRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category);
        } else {
            allActive = equipmentRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }

        double finalRadiusKm = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;

        return allActive.stream()
                .map(eq -> {
                    Double dist = null;
                    if (userLat != null && userLng != null && eq.getLocationLat() != null && eq.getLocationLng() != null) {
                        dist = haversineKm(userLat, userLng, eq.getLocationLat(), eq.getLocationLng());
                    }
                    return Map.entry(eq, dist);
                })
                .filter(entry -> {  // If no user location provided, keep everything
                    if (userLat == null || userLng == null) return true;
                    // Otherwise, must have calculable distance within radius
                    return entry.getValue() != null && entry.getValue() <= finalRadiusKm;
                })
                .sorted((e1, e2) -> {
                    if (e1.getValue() == null && e2.getValue() == null) return 0;
                    if (e1.getValue() == null) return 1;
                    if (e2.getValue() == null) return -1;
                    return Double.compare(e1.getValue(), e2.getValue());
                })
                .map(entry -> mapEquipmentToResponse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    // ─── Cost & Booking Workflows ──────────────────────────────────────────

    public Double calculateCost(Long equipmentId, LocalDateTime startTime, LocalDateTime endTime) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        if (startTime.isAfter(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }

        long durationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        double hours = durationMinutes / 60.0;

        if (hours <= 0) {
            throw new BadRequestException("Duration must be greater than zero");
        }

        double hourlyCost = hours * equipment.getHourlyRate();
        double days = Math.ceil(hours / 24.0);
        double dailyCost = days * equipment.getDailyRate();

        // return the cheaper of the two when duration is >= 8 hours
        if (hours >= 8.0) {
            return Math.min(hourlyCost, dailyCost);
        } else {
            return hourlyCost;
        }
    }

    @Transactional
    public Map<String, Object> requestBooking(Long renterId, Long equipmentId, LocalDateTime startTime, LocalDateTime endTime, String notes) {
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("Renter not found"));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        if (!equipment.getIsActive()) {
            throw new BadRequestException("This equipment is not currently active for bookings");
        }

        if (equipment.getOwner().getId().equals(renterId)) {
            throw new BadRequestException("You cannot rent your own equipment");
        }

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Booking start time cannot be in the past");
        }

        // Validate time-slot overlap
        long overlapCount = equipmentBookingRepository.countOverlapping(equipmentId, startTime, endTime);
        if (overlapCount > 0) {
            throw new BadRequestException("The selected time slot conflicts with an existing booking");
        }

        Double totalCost = calculateCost(equipmentId, startTime, endTime);

        EquipmentBooking booking = EquipmentBooking.builder()
                .equipment(equipment)
                .renter(renter)
                .startTime(startTime)
                .endTime(endTime)
                .totalCost(totalCost)
                .status(BookingStatus.PENDING)
                .notes(notes)
                .build();

        EquipmentBooking saved = equipmentBookingRepository.save(booking);
        log.info("Booking request created for equipment {} by renter {} (Cost: ₹{})", equipmentId, renterId, totalCost);

        // Notify equipment owner
        notificationService.create(
                equipment.getOwner().getId(),
                "New Booking Request",
                renter.getName() + " requested to rent your " + equipment.getName() + " from " +
                        startTime.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) + " to " +
                        endTime.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
                NotificationType.GENERAL,
                "/app/machinery"
        );

        return mapBookingToResponse(saved);
    }

    @Transactional
    public Map<String, Object> approveBooking(Long bookingId, Long ownerId) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found"));

        if (!booking.getEquipment().getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You do not own the equipment for this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("This booking request is not pending approval");
        }

        // Re-validate overlaps (race condition check)
        long overlapCount = equipmentBookingRepository.countOverlappingExcludeSelf(
                booking.getEquipment().getId(), bookingId, booking.getStartTime(), booking.getEndTime());
        if (overlapCount > 0) {
            booking.setStatus(BookingStatus.REJECTED);
            equipmentBookingRepository.save(booking);
            throw new BadRequestException("This booking cannot be approved due to a schedule conflict. It has been auto-rejected.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        EquipmentBooking saved = equipmentBookingRepository.save(booking);
        log.info("Booking request {} approved by owner {}", bookingId, ownerId);

        // Notify renter
        notificationService.create(
                booking.getRenter().getId(),
                "Booking Approved! 🎉",
                "Your booking request for " + booking.getEquipment().getName() + " has been approved by the owner.",
                NotificationType.GENERAL,
                "/app/machinery"
        );

        return mapBookingToResponse(saved);
    }

    @Transactional
    public Map<String, Object> rejectBooking(Long bookingId, Long ownerId) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found"));

        if (!booking.getEquipment().getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You do not own the equipment for this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("This booking request is not pending");
        }

        booking.setStatus(BookingStatus.REJECTED);
        EquipmentBooking saved = equipmentBookingRepository.save(booking);
        log.info("Booking request {} rejected by owner {}", bookingId, ownerId);

        // Notify renter
        notificationService.create(
                booking.getRenter().getId(),
                "Booking Update",
                "Your booking request for " + booking.getEquipment().getName() + " has been rejected.",
                NotificationType.GENERAL,
                "/app/machinery"
        );

        return mapBookingToResponse(saved);
    }

    @Transactional
    public Map<String, Object> completeBooking(Long bookingId, Long ownerId) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found"));

        if (!booking.getEquipment().getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You do not own the equipment for this booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be marked as completed");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        EquipmentBooking saved = equipmentBookingRepository.save(booking);
        log.info("Booking {} marked completed by owner {}", bookingId, ownerId);

        // Notify renter
        notificationService.create(
                booking.getRenter().getId(),
                "Rental Booking Completed",
                "Your rental booking of " + booking.getEquipment().getName() + " is marked as completed.",
                NotificationType.GENERAL,
                "/app/machinery"
        );

        return mapBookingToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyBookings(Long renterId) {
        return equipmentBookingRepository.findByRenterIdOrderByCreatedAtDesc(renterId)
                .stream()
                .map(this::mapBookingToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getIncomingRequests(Long ownerId) {
        return equipmentBookingRepository.findByEquipmentOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::mapBookingToResponse)
                .collect(Collectors.toList());
    }

    // ─── Helpers & Mappers ───────────────────────────────────────────────

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private Map<String, Object> mapEquipmentToResponse(Equipment eq, Double distanceKm) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", eq.getId());
        map.put("ownerId", eq.getOwner().getId());
        map.put("ownerName", eq.getOwner().getName());
        map.put("ownerPhone", eq.getOwner().getPhone());
        map.put("name", eq.getName());
        map.put("category", eq.getCategory().name());
        map.put("description", eq.getDescription());
        map.put("hourlyRate", eq.getHourlyRate());
        map.put("dailyRate", eq.getDailyRate());
        map.put("imageUrl", eq.getImageUrl());
        map.put("locationLat", eq.getLocationLat());
        map.put("locationLng", eq.getLocationLng());
        map.put("village", eq.getVillage());
        map.put("isActive", eq.getIsActive());
        map.put("createdAt", eq.getCreatedAt() != null ? eq.getCreatedAt().toString() : null);
        if (distanceKm != null) {
            map.put("distanceKm", Math.round(distanceKm * 10.0) / 10.0); // round to 1 decimal place
        }
        return map;
    }

    private Map<String, Object> mapBookingToResponse(EquipmentBooking b) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("equipmentId", b.getEquipment().getId());
        map.put("equipmentName", b.getEquipment().getName());
        map.put("equipmentCategory", b.getEquipment().getCategory().name());
        map.put("ownerId", b.getEquipment().getOwner().getId());
        map.put("ownerName", b.getEquipment().getOwner().getName());
        map.put("ownerPhone", b.getEquipment().getOwner().getPhone());
        map.put("renterId", b.getRenter().getId());
        map.put("renterName", b.getRenter().getName());
        map.put("renterPhone", b.getRenter().getPhone());
        map.put("startTime", b.getStartTime() != null ? b.getStartTime().toString() : null);
        map.put("endTime", b.getEndTime() != null ? b.getEndTime().toString() : null);
        map.put("totalCost", b.getTotalCost());
        map.put("status", b.getStatus().name());
        map.put("notes", b.getNotes());
        map.put("createdAt", b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        return map;
    }
}

package com.farmsetu.service;

import com.farmsetu.model.entity.CropCalendar;
import com.farmsetu.model.entity.FarmerProfile;
import com.farmsetu.model.entity.FarmExpense;
import com.farmsetu.model.entity.Notification;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.entity.Farm;
import com.farmsetu.repository.CropCalendarRepository;
import com.farmsetu.repository.FarmerProfileRepository;
import com.farmsetu.repository.FarmExpenseRepository;
import com.farmsetu.repository.NotificationRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.repository.FarmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FarmDashboardService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final FarmExpenseRepository farmExpenseRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;

    public Map<String, Object> getDashboard(Long farmerId) {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("activeCalendars", cropCalendarRepository.findByFarmerId(farmerId));
        dashboard.put("recentNotifications",
                notificationRepository.findByUserIdOrderByCreatedAtDesc(farmerId, org.springframework.data.domain.PageRequest.of(0, 5)));
        
        FarmerProfile profile = farmerProfileRepository.findByUserId(farmerId).orElse(null);
        if (profile != null) {
            dashboard.put("farmProfile", profile);
        }

        List<Farm> farms = farmRepository.findByUserId(farmerId);
        if (farms.isEmpty() && profile != null && (profile.getFarmArea() != null || profile.getFarmBoundary() != null)) {
            // Auto-migrate existing single profile farm parameters to a default farm
            Farm defaultFarm = Farm.builder()
                    .user(profile.getUser())
                    .name("Primary Farm")
                    .farmArea(profile.getFarmArea())
                    .soilType(profile.getSoilType())
                    .soilPh(profile.getSoilPh())
                    .waterSource(profile.getWaterSource())
                    .farmingType(profile.getFarmingType())
                    .farmBoundary(profile.getFarmBoundary())
                    .nitrogen(profile.getNitrogen())
                    .phosphorus(profile.getPhosphorus())
                    .potassium(profile.getPotassium())
                    .temperature(profile.getTemperature())
                    .humidity(profile.getHumidity())
                    .rainfall(profile.getRainfall())
                    .waterLevel(profile.getWaterLevel())
                    .latitude(profile.getUser() != null ? profile.getUser().getLatitude() : null)
                    .longitude(profile.getUser() != null ? profile.getUser().getLongitude() : null)
                    .build();
            defaultFarm = farmRepository.save(defaultFarm);
            farms = new ArrayList<>();
            farms.add(defaultFarm);
        }
        dashboard.put("farms", farms);
        return dashboard;
    }

    public Map<String, Object> getAnalytics(Long farmerId) {
        List<FarmExpense> expenses = farmExpenseRepository.findByFarmerId(farmerId);
        BigDecimal totalExpenses = expenses.stream()
                .map(FarmExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of(
                "totalExpenses", totalExpenses,
                "expenseCount", expenses.size(),
                "activeCrops", cropCalendarRepository.findByFarmerId(farmerId).size()
        );
    }

    @Transactional
    public FarmerProfile saveFarmDetails(Long farmerId, FarmerProfile profile) {
        User user = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + farmerId));

        // Update user latitude/longitude if passed in profile.user DTO
        if (profile.getUser() != null) {
            if (profile.getUser().getLatitude() != null) user.setLatitude(profile.getUser().getLatitude());
            if (profile.getUser().getLongitude() != null) user.setLongitude(profile.getUser().getLongitude());
            userRepository.save(user);
        }

        return farmerProfileRepository.findByUserId(farmerId)
                .map(existing -> {
                    existing.setFarmArea(profile.getFarmArea());
                    existing.setSoilType(profile.getSoilType());
                    existing.setSoilPh(profile.getSoilPh());
                    existing.setWaterSource(profile.getWaterSource());
                    existing.setFarmingExperience(profile.getFarmingExperience());
                    existing.setFarmingType(profile.getFarmingType());
                    existing.setFarmBoundary(profile.getFarmBoundary());
                    existing.setNitrogen(profile.getNitrogen());
                    existing.setPhosphorus(profile.getPhosphorus());
                    existing.setPotassium(profile.getPotassium());
                    existing.setTemperature(profile.getTemperature());
                    existing.setHumidity(profile.getHumidity());
                    existing.setRainfall(profile.getRainfall());
                    existing.setWaterLevel(profile.getWaterLevel());
                    if (profile.getCurrentCrops() != null) existing.setCurrentCrops(profile.getCurrentCrops());
                    return farmerProfileRepository.save(existing);
                })
                .orElseGet(() -> {
                    profile.setUser(user);
                    return farmerProfileRepository.save(profile);
                });
    }

    @Transactional
    public Farm saveNewFarm(Long farmerId, Farm farm) {
        User user = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + farmerId));
        farm.setUser(user);
        return farmRepository.save(farm);
    }

    @Transactional
    public Farm updateFarm(Long farmerId, Long farmId, Farm farmDetails) {
        Farm existing = farmRepository.findById(farmId)
                .orElseThrow(() -> new IllegalArgumentException("Farm not found: " + farmId));

        if (!existing.getUser().getId().equals(farmerId)) {
            throw new IllegalArgumentException("Unauthorized access to this farm");
        }

        existing.setName(farmDetails.getName());
        existing.setFarmArea(farmDetails.getFarmArea());
        existing.setCalculatedArea(farmDetails.getCalculatedArea());
        existing.setSoilType(farmDetails.getSoilType());
        existing.setSoilPh(farmDetails.getSoilPh());
        existing.setWaterSource(farmDetails.getWaterSource());
        existing.setFarmingType(farmDetails.getFarmingType());
        existing.setFarmBoundary(farmDetails.getFarmBoundary());
        existing.setNitrogen(farmDetails.getNitrogen());
        existing.setPhosphorus(farmDetails.getPhosphorus());
        existing.setPotassium(farmDetails.getPotassium());
        existing.setTemperature(farmDetails.getTemperature());
        existing.setHumidity(farmDetails.getHumidity());
        existing.setRainfall(farmDetails.getRainfall());
        existing.setWaterLevel(farmDetails.getWaterLevel());
        existing.setLatitude(farmDetails.getLatitude());
        existing.setLongitude(farmDetails.getLongitude());

        // Sync coordinates to User if set
        if (farmDetails.getLatitude() != null && farmDetails.getLongitude() != null) {
            User user = existing.getUser();
            user.setLatitude(farmDetails.getLatitude());
            user.setLongitude(farmDetails.getLongitude());
            userRepository.save(user);
        }

        return farmRepository.save(existing);
    }

    @Transactional
    public void deleteFarm(Long farmerId, Long farmId) {
        Farm existing = farmRepository.findById(farmId)
                .orElseThrow(() -> new IllegalArgumentException("Farm not found: " + farmId));

        if (!existing.getUser().getId().equals(farmerId)) {
            throw new IllegalArgumentException("Unauthorized access to this farm");
        }

        farmRepository.delete(existing);
    }
}

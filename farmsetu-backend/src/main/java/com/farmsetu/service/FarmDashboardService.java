package com.farmsetu.service;

import com.farmsetu.model.entity.CropCalendar;
import com.farmsetu.model.entity.FarmerProfile;
import com.farmsetu.model.entity.FarmExpense;
import com.farmsetu.model.entity.Notification;
import com.farmsetu.repository.CropCalendarRepository;
import com.farmsetu.repository.FarmerProfileRepository;
import com.farmsetu.repository.FarmExpenseRepository;
import com.farmsetu.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FarmDashboardService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final FarmExpenseRepository farmExpenseRepository;
    private final NotificationRepository notificationRepository;

    public Map<String, Object> getDashboard(Long farmerId) {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("activeCalendars", cropCalendarRepository.findByFarmerId(farmerId));
        dashboard.put("recentNotifications",
                notificationRepository.findByUserIdOrderByCreatedAtDesc(farmerId, org.springframework.data.domain.PageRequest.of(0, 5)));
        farmerProfileRepository.findByUserId(farmerId).ifPresent(p -> dashboard.put("farmProfile", p));
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
        return farmerProfileRepository.findByUserId(farmerId)
                .map(existing -> {
                    existing.setFarmArea(profile.getFarmArea());
                    existing.setSoilType(profile.getSoilType());
                    existing.setSoilPh(profile.getSoilPh());
                    existing.setWaterSource(profile.getWaterSource());
                    existing.setFarmingExperience(profile.getFarmingExperience());
                    existing.setFarmingType(profile.getFarmingType());
                    if (profile.getCurrentCrops() != null) existing.setCurrentCrops(profile.getCurrentCrops());
                    return farmerProfileRepository.save(existing);
                })
                .orElseGet(() -> farmerProfileRepository.save(profile));
    }
}

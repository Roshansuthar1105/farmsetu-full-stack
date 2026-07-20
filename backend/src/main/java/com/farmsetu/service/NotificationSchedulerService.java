package com.farmsetu.service;

import com.farmsetu.model.entity.CalendarTask;
import com.farmsetu.model.entity.DailyPrice;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.NotificationType;
import com.farmsetu.repository.CalendarTaskRepository;
import com.farmsetu.repository.DailyPriceRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final WeatherService weatherService;
    private final CalendarTaskRepository calendarTaskRepository;
    private final DailyPriceRepository dailyPriceRepository;

    /**
     * Daily Weather Rain Warnings at 06:00 AM.
     * Checks open meteorology forecasts for heavy rain (>15mm) at farmers' GPS coordinates.
     */
    @Scheduled(cron = "0 0 6 * * ?")
    public void checkWeatherAlerts() {
        log.info("Running scheduled Weather Rain Warnings check...");
        List<User> farmers = userRepository.findAll();
        for (User farmer : farmers) {
            if (farmer.getLatitude() != null && farmer.getLongitude() != null) {
                try {
                    List<Map<String, Object>> forecast = weatherService.forecast(farmer.getLatitude(), farmer.getLongitude(), 1);
                    if (!forecast.isEmpty()) {
                        Object rainObj = forecast.get(0).get("rainMm");
                        double rainMm = rainObj instanceof Number ? ((Number) rainObj).doubleValue() : 0.0;
                        if (rainMm >= 15.0) {
                            notificationService.create(
                                    farmer.getId(),
                                    "Severe Rain Warning Alert",
                                    String.format("Heavy rain showers (%.1f mm) predicted in your village today. Move harvested crops to dry shelter.", rainMm),
                                    NotificationType.WEATHER,
                                    "/app/weather"
                            );
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch weather alert for user {}: {}", farmer.getId(), e.getMessage());
                }
            }
        }
    }

    /**
     * Daily Crop Calendar Reminders at 07:00 AM.
     * Checks pending tasks due today.
     */
    @Scheduled(cron = "0 0 7 * * ?")
    public void checkCropCalendarReminders() {
        log.info("Running scheduled Crop Calendar Task Reminders check...");
        try {
            LocalDate today = LocalDate.now();
            List<CalendarTask> allTasks = calendarTaskRepository.findAll();
            for (CalendarTask task : allTasks) {
                if (!task.isCompleted() && task.getScheduledDate() != null) {
                    if (task.getScheduledDate().equals(today) && task.getCalendar() != null && task.getCalendar().getFarmer() != null) {
                        Long farmerId = task.getCalendar().getFarmer().getId();
                        String cropName = task.getCalendar().getCrop() != null ? task.getCalendar().getCrop().getName() : "Plot";
                        notificationService.create(
                                farmerId,
                                "Smart Calendar Reminder: " + task.getTaskName(),
                                String.format("Time to perform %s on your %s crop (%s). Scheduled for today.", task.getTaskType(), cropName, task.getScheduledDate()),
                                NotificationType.TASK_REMINDER,
                                "/app/crop-calendar"
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to check crop calendar task reminders: {}", e.getMessage());
        }
    }

    /**
     * Daily Mandi Price Surge Alerts at 06:00 PM.
     * Checks price records for high market modal prices.
     */
    @Scheduled(cron = "0 0 18 * * ?")
    public void checkMandiPriceSurges() {
        log.info("Running scheduled Mandi Price Surge check...");
        try {
            List<DailyPrice> latestPrices = dailyPriceRepository.findAll();
            if (latestPrices.isEmpty()) return;

            // Find highest priced commodity
            DailyPrice topSurge = latestPrices.stream()
                    .filter(dp -> dp.getModalPrice() != null && dp.getModalPrice().compareTo(BigDecimal.valueOf(2500)) > 0)
                    .findFirst().orElse(null);

            if (topSurge != null && topSurge.getCommodity() != null && topSurge.getMandi() != null) {
                List<User> farmers = userRepository.findAll();
                for (User farmer : farmers) {
                    notificationService.create(
                            farmer.getId(),
                            "Mandi Rate Surge Alert",
                            String.format("%s rate at %s Mandi surged to ₹%s per quintal. High trade volume reported.",
                                    topSurge.getCommodity().getName(), topSurge.getMandi().getName(), topSurge.getModalPrice()),
                            NotificationType.PRICE_ALERT,
                            "/app/market-analysis"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to check Mandi price surges: {}", e.getMessage());
        }
    }
}

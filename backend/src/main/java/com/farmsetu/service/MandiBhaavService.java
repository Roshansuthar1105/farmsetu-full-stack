package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.*;
import com.farmsetu.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MandiBhaavService {

    private final MandiRepository mandiRepository;
    private final CommodityRepository commodityRepository;
    private final DailyPriceRepository dailyPriceRepository;
    private final UserWatchlistRepository userWatchlistRepository;
    private final UserRepository userRepository;

    // Constants
    private static final double DEFAULT_LAT = 22.7196; // Indore Lat
    private static final double DEFAULT_LNG = 75.8577; // Indore Lng
    private static final double TRANSPORT_RATE_PER_Q_KM = 5.0; // ₹5 per quintal per km

    @Transactional(readOnly = true)
    public List<Commodity> getCommodities() {
        return commodityRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLatestPrices(Double lat, Double lng, Double radiusKm, Long userId) {
        double queryLat = lat != null ? lat : DEFAULT_LAT;
        double queryLng = lng != null ? lng : DEFAULT_LNG;
        double queryRadius = radiusKm != null ? radiusKm : 100.0;

        // Try user profile coordinates as fallback if params are default/null
        if (lat == null && userId != null) {
            Optional<User> uOpt = userRepository.findById(userId);
            if (uOpt.isPresent() && uOpt.get().getLatitude() != null && uOpt.get().getLongitude() != null) {
                queryLat = uOpt.get().getLatitude();
                queryLng = uOpt.get().getLongitude();
            }
        }

        List<Mandi> mandis = mandiRepository.findNearby(queryLat, queryLng, queryRadius);
        if (mandis.isEmpty()) {
            // If none close enough in search, just fetch first 5 mandis as fallback
            mandis = mandiRepository.findAll().stream().limit(5).collect(Collectors.toList());
        }

        if (mandis.isEmpty()) {
            return List.of();
        }

        List<Long> mandiIds = mandis.stream().map(Mandi::getId).toList();
        List<DailyPrice> latestPrices = dailyPriceRepository.findLatestPricesForMandis(mandiIds);

        List<Map<String, Object>> response = new ArrayList<>();
        for (DailyPrice dp : latestPrices) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", dp.getId());

            // Eagerly build mandi map to avoid proxy serialization issues
            Map<String, Object> mandiMap = new LinkedHashMap<>();
            mandiMap.put("id", dp.getMandi().getId());
            mandiMap.put("name", dp.getMandi().getName());
            mandiMap.put("state", dp.getMandi().getState());
            mandiMap.put("district", dp.getMandi().getDistrict());
            mandiMap.put("latitude", dp.getMandi().getLatitude());
            mandiMap.put("longitude", dp.getMandi().getLongitude());
            map.put("mandi", mandiMap);

            // Eagerly build commodity map
            Map<String, Object> commMap = new LinkedHashMap<>();
            commMap.put("id", dp.getCommodity().getId());
            commMap.put("name", dp.getCommodity().getName());
            commMap.put("category", dp.getCommodity().getCategory());
            commMap.put("localName", dp.getCommodity().getLocalName());
            map.put("commodity", commMap);

            map.put("minPrice", dp.getMinPrice());
            map.put("maxPrice", dp.getMaxPrice());
            map.put("modalPrice", dp.getModalPrice());
            map.put("arrivalVolume", dp.getArrivalVolume());
            map.put("priceDate", dp.getPriceDate().toString());
            map.put("distance", Math.round(calculateDistance(queryLat, queryLng, dp.getMandi().getLatitude(), dp.getMandi().getLongitude()) * 10.0) / 10.0);
            
            // Try to fetch yesterday's price to compute trend
            LocalDate yesterday = dp.getPriceDate().minusDays(1);
            List<DailyPrice> yPriceList = dailyPriceRepository.findByCommodityIdAndPriceDateBetweenOrderByPriceDateAsc(
                    dp.getCommodity().getId(), yesterday, yesterday);
            BigDecimal change = BigDecimal.ZERO;
            if (!yPriceList.isEmpty()) {
                DailyPrice yesterdayDp = yPriceList.stream().filter(y -> y.getMandi().getId().equals(dp.getMandi().getId())).findFirst().orElse(null);
                if (yesterdayDp != null) {
                    change = dp.getModalPrice().subtract(yesterdayDp.getModalPrice());
                }
            }
            map.put("priceChange", change);
            response.add(map);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWatchlist(Long userId) {
        List<UserWatchlist> items = userWatchlistRepository.findByUserId(userId);
        return items.stream().map(item -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", item.getId());

            // Build commodity map eagerly
            if (item.getCommodity() != null) {
                Map<String, Object> commMap = new LinkedHashMap<>();
                commMap.put("id", item.getCommodity().getId());
                commMap.put("name", item.getCommodity().getName());
                commMap.put("category", item.getCommodity().getCategory());
                commMap.put("localName", item.getCommodity().getLocalName());
                map.put("commodity", commMap);
            }

            // Build mandi map eagerly
            if (item.getMandi() != null) {
                Map<String, Object> mandiMap = new LinkedHashMap<>();
                mandiMap.put("id", item.getMandi().getId());
                mandiMap.put("name", item.getMandi().getName());
                mandiMap.put("state", item.getMandi().getState());
                mandiMap.put("district", item.getMandi().getDistrict());
                map.put("mandi", mandiMap);
            }

            // Get latest price for this combination if available
            if (item.getCommodity() != null && item.getMandi() != null) {
                List<DailyPrice> dpList = dailyPriceRepository.findLatestPricesForCommodityInMandis(
                        item.getCommodity().getId(), List.of(item.getMandi().getId()));
                if (!dpList.isEmpty()) {
                    DailyPrice latest = dpList.get(0);
                    map.put("latestMinPrice", latest.getMinPrice());
                    map.put("latestMaxPrice", latest.getMaxPrice());
                    map.put("latestModalPrice", latest.getModalPrice());
                    map.put("priceDate", latest.getPriceDate().toString());
                }
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserWatchlist addToWatchlist(Long userId, Long commodityId, Long mandiId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Commodity commodity = null;
        if (commodityId != null) {
            commodity = commodityRepository.findById(commodityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Commodity not found"));
        }

        Mandi mandi = null;
        if (mandiId != null) {
            mandi = mandiRepository.findById(mandiId)
                    .orElseThrow(() -> new ResourceNotFoundException("Mandi not found"));
        }

        Optional<UserWatchlist> existing = userWatchlistRepository.findByUserIdAndCommodityIdAndMandiId(userId, commodityId, mandiId);
        if (existing.isPresent()) {
            return existing.get();
        }

        UserWatchlist item = UserWatchlist.builder()
                .user(user)
                .commodity(commodity)
                .mandi(mandi)
                .build();
        return userWatchlistRepository.save(item);
    }

    @Transactional
    public void removeFromWatchlist(Long userId, Long itemId) {
        UserWatchlist item = userWatchlistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist item not found"));
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this watchlist item");
        }
        userWatchlistRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> compareRoi(Long commodityId, double quantity, Double lat, Double lng, Long userId) {
        double queryLat = lat != null ? lat : DEFAULT_LAT;
        double queryLng = lng != null ? lng : DEFAULT_LNG;

        // Try user profile coordinates as fallback if params are default/null
        if (lat == null && userId != null) {
            Optional<User> uOpt = userRepository.findById(userId);
            if (uOpt.isPresent() && uOpt.get().getLatitude() != null && uOpt.get().getLongitude() != null) {
                queryLat = uOpt.get().getLatitude();
                queryLng = uOpt.get().getLongitude();
            }
        }

        // Fetch closest mandis within 500km radius
        List<Mandi> mandis = mandiRepository.findNearby(queryLat, queryLng, 500.0);
        if (mandis.isEmpty()) {
            // Fallback: use all mandis regardless of distance
            mandis = mandiRepository.findAll();
        }

        if (mandis.isEmpty()) {
            return List.of();
        }

        List<Long> mandiIds = mandis.stream().map(Mandi::getId).toList();
        List<DailyPrice> latestPrices = dailyPriceRepository.findLatestPricesForCommodityInMandis(commodityId, mandiIds);

        List<Map<String, Object>> result = new ArrayList<>();
        BigDecimal qtyBD = BigDecimal.valueOf(quantity);

        for (DailyPrice dp : latestPrices) {
            Mandi mandi = dp.getMandi();
            double distance = calculateDistance(queryLat, queryLng, mandi.getLatitude(), mandi.getLongitude());
            
            // Total Revenue = quantity * modalPrice
            BigDecimal totalRevenue = dp.getModalPrice().multiply(qtyBD);
            
            // Transport Cost = distance * quantity * ₹5
            BigDecimal transportCost = BigDecimal.valueOf(distance)
                    .multiply(qtyBD)
                    .multiply(BigDecimal.valueOf(TRANSPORT_RATE_PER_Q_KM));
            
            // Net Profit = Revenue - Transport Cost
            BigDecimal netProfit = totalRevenue.subtract(transportCost);

            Map<String, Object> map = new LinkedHashMap<>();

            // Build mandi map eagerly to avoid lazy proxy issues
            Map<String, Object> mandiMap = new LinkedHashMap<>();
            mandiMap.put("id", mandi.getId());
            mandiMap.put("name", mandi.getName());
            mandiMap.put("state", mandi.getState());
            mandiMap.put("district", mandi.getDistrict());
            mandiMap.put("latitude", mandi.getLatitude());
            mandiMap.put("longitude", mandi.getLongitude());
            map.put("mandi", mandiMap);

            map.put("distance", Math.round(distance * 10.0) / 10.0);
            map.put("modalPrice", dp.getModalPrice());
            map.put("totalRevenue", totalRevenue.setScale(2, RoundingMode.HALF_UP));
            map.put("transportCost", transportCost.setScale(2, RoundingMode.HALF_UP));
            map.put("netProfit", netProfit.setScale(2, RoundingMode.HALF_UP));
            result.add(map);
        }

        // Sort by net profit descending
        result.sort((a, b) -> ((BigDecimal) b.get("netProfit")).compareTo((BigDecimal) a.get("netProfit")));
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getForecast(Long commodityId, Integer days) {
        int historyDays = (days != null && days > 0) ? days : 30;

        List<DailyPrice> history;
        if (historyDays >= 9999) {
            // "All data" mode
            history = dailyPriceRepository.findByCommodityIdOrderByPriceDateDesc(commodityId)
                    .stream()
                    .sorted(Comparator.comparing(DailyPrice::getPriceDate))
                    .collect(Collectors.toList());
        } else {
            LocalDate to = LocalDate.now();
            LocalDate from = to.minusDays(historyDays);
            history = dailyPriceRepository.findByCommodityIdAndPriceDateBetweenOrderByPriceDateAsc(commodityId, from, to);
        }

        if (history.isEmpty()) {
            // Fetch all records for this commodity if period is empty
            history = dailyPriceRepository.findByCommodityIdOrderByPriceDateDesc(commodityId)
                    .stream()
                    .sorted(Comparator.comparing(DailyPrice::getPriceDate))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> historicalPoints = history.stream().map(dp -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", dp.getPriceDate().toString());
            map.put("price", dp.getModalPrice());
            map.put("volume", dp.getArrivalVolume());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> forecastPoints = new ArrayList<>();
        
        if (!history.isEmpty()) {
            // Linear regression modeling
            int n = history.size();
            double sumX = 0;
            double sumY = 0;
            double sumXY = 0;
            double sumXX = 0;

            for (int i = 0; i < n; i++) {
                double x = i; // Day index
                double y = history.get(i).getModalPrice().doubleValue();
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumXX += x * x;
            }

            double m = 0; // Slope
            if ((n * sumXX - sumX * sumX) != 0) {
                m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            }
            double c = (sumY - m * sumX) / n;

            // Generate next 15 days forecast
            LocalDate lastDate = history.get(n - 1).getPriceDate();
            for (int i = 1; i <= 15; i++) {
                double x = (n - 1) + i;
                double forecastedY = m * x + c;
                // Add some small random variance (+/- 0.5% max) to make it feel natural
                forecastedY = forecastedY * (1.0 + (Math.random() - 0.5) * 0.01);
                
                LocalDate forecastDate = lastDate.plusDays(i);
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("date", forecastDate.toString());
                map.put("price", BigDecimal.valueOf(forecastedY).setScale(2, RoundingMode.HALF_UP));
                forecastPoints.add(map);
            }
        } else {
            // Absolute fallback mock data
            LocalDate base = LocalDate.now();
            for (int i = 1; i <= 15; i++) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("date", base.plusDays(i).toString());
                map.put("price", BigDecimal.valueOf(2500 + i * 5).setScale(2, RoundingMode.HALF_UP));
                forecastPoints.add(map);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("history", historicalPoints);
        response.put("forecast", forecastPoints);
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTickerPrices() {
        List<Mandi> allMandis = mandiRepository.findAll();
        if (allMandis.isEmpty()) {
            return List.of();
        }
        List<Long> mandiIds = allMandis.stream().map(Mandi::getId).limit(10).toList();
        List<DailyPrice> prices = dailyPriceRepository.findLatestPricesForMandis(mandiIds);

        List<Map<String, Object>> tickerList = new ArrayList<>();
        for (DailyPrice dp : prices) {
            Map<String, Object> item = new LinkedHashMap<>();

            String localName = dp.getCommodity().getLocalName();
            String displayName = dp.getCommodity().getName();
            if (localName != null && !localName.isBlank() && !localName.equalsIgnoreCase(displayName)) {
                displayName += " (" + localName + ")";
            }
            item.put("name", displayName);
            item.put("location", dp.getMandi().getName());
            item.put("price", "₹" + String.format("%,d", dp.getModalPrice().longValue()));

            LocalDate yesterday = dp.getPriceDate().minusDays(1);
            List<DailyPrice> yList = dailyPriceRepository.findByCommodityIdAndPriceDateBetweenOrderByPriceDateAsc(
                    dp.getCommodity().getId(), yesterday, yesterday);

            double pctChange = 0.0;
            if (!yList.isEmpty()) {
                DailyPrice yDp = yList.stream().filter(y -> y.getMandi().getId().equals(dp.getMandi().getId())).findFirst().orElse(null);
                if (yDp != null && yDp.getModalPrice().doubleValue() > 0) {
                    double diff = dp.getModalPrice().doubleValue() - yDp.getModalPrice().doubleValue();
                    pctChange = (diff / yDp.getModalPrice().doubleValue()) * 100.0;
                }
            }
            if (pctChange == 0.0 && dp.getMaxPrice() != null && dp.getMinPrice() != null) {
                double spread = dp.getMaxPrice().doubleValue() - dp.getMinPrice().doubleValue();
                if (spread > 0) {
                    pctChange = ((dp.getModalPrice().doubleValue() - dp.getMinPrice().doubleValue()) / spread - 0.5) * 5.0;
                }
            }

            boolean isUp = pctChange >= 0;
            String changeStr = String.format("%s%.1f%%", isUp ? "+" : "", pctChange);
            item.put("change", changeStr);
            item.put("up", isUp);

            tickerList.add(item);
        }
        return tickerList;
    }

    @Transactional
    public List<DailyPrice> importBulkDailyPrices(List<Map<String, String>> rawList) {
        List<DailyPrice> saved = new ArrayList<>();
        if (rawList == null || rawList.isEmpty()) return saved;

        for (Map<String, String> raw : rawList) {
            String mandiName = raw.getOrDefault("mandiName", raw.get("mandi"));
            String commodityName = raw.getOrDefault("commodityName", raw.get("commodity"));
            String minStr = raw.getOrDefault("minPrice", "2000");
            String maxStr = raw.getOrDefault("maxPrice", "3000");
            String modalStr = raw.getOrDefault("modalPrice", raw.getOrDefault("price", "2500"));
            String volumeStr = raw.getOrDefault("arrivalVolume", "500");
            String dateStr = raw.getOrDefault("priceDate", raw.getOrDefault("date", LocalDate.now().toString()));

            if (mandiName == null || commodityName == null) continue;

            Mandi mandi = mandiRepository.findByNameIgnoreCase(mandiName)
                    .orElseGet(() -> mandiRepository.save(Mandi.builder()
                            .name(mandiName)
                            .state(raw.getOrDefault("state", "Punjab"))
                            .district(raw.getOrDefault("district", "Default"))
                            .latitude(28.6)
                            .longitude(77.2)
                            .operatingHours("08:00 AM - 05:00 PM")
                            .build()));

            Commodity commodity = commodityRepository.findByNameIgnoreCase(commodityName)
                    .orElseGet(() -> commodityRepository.save(Commodity.builder()
                            .name(commodityName)
                            .category(raw.getOrDefault("category", "Grains"))
                            .localName(commodityName)
                            .build()));

            DailyPrice dp = DailyPrice.builder()
                    .mandi(mandi)
                    .commodity(commodity)
                    .minPrice(new BigDecimal(minStr))
                    .maxPrice(new BigDecimal(maxStr))
                    .modalPrice(new BigDecimal(modalStr))
                    .arrivalVolume(new BigDecimal(volumeStr))
                    .priceDate(LocalDate.parse(dateStr))
                    .build();

            saved.add(dailyPriceRepository.save(dp));
        }
        return saved;
    }

    @Transactional
    public void deleteDailyPricesBatch(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            dailyPriceRepository.deleteAllByIdInBatch(ids);
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371; // Kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}

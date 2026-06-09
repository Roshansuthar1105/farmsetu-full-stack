package com.farmsetu.config;

import com.farmsetu.model.entity.Commodity;
import com.farmsetu.model.entity.DailyPrice;
import com.farmsetu.model.entity.Mandi;
import com.farmsetu.repository.CommodityRepository;
import com.farmsetu.repository.DailyPriceRepository;
import com.farmsetu.repository.MandiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(10) // Seed after default seeder runs
public class MandiBhaavSeeder implements CommandLineRunner {

    private final MandiRepository mandiRepository;
    private final CommodityRepository commodityRepository;
    private final DailyPriceRepository dailyPriceRepository;

    @Override
    public void run(String... args) throws Exception {
        if (commodityRepository.count() > 0 && dailyPriceRepository.count() > 0) {
            log.info("Mandi Bhaav data already seeded. Skipping Mandi Bhaav seeder.");
            return;
        }

        log.info("Seeding Mandi Bhaav (Market Trends) data...");

        // 1. Seed Mandis if empty
        List<Mandi> mandis = mandiRepository.findAll();
        if (mandis.isEmpty()) {
            mandis = new ArrayList<>();
            mandis.add(Mandi.builder().name("Indore Mandi").state("Madhya Pradesh").district("Indore").latitude(22.7196).longitude(75.8577).address("Indore APMC Yard, Laxmi Bai Nagar").build());
            mandis.add(Mandi.builder().name("Bhopal Mandi").state("Madhya Pradesh").district("Bhopal").latitude(23.2599).longitude(77.4126).address("Bhopal APMC Yard, Karond").build());
            mandis.add(Mandi.builder().name("Dewas Mandi").state("Madhya Pradesh").district("Dewas").latitude(22.9623).longitude(76.0508).address("Dewas APMC Yard, Dewas Road").build());
            mandis.add(Mandi.builder().name("Ujjain Mandi").state("Madhya Pradesh").district("Ujjain").latitude(23.1760).longitude(75.7885).address("Ujjain APMC Yard, Chimanganj").build());
            mandis.add(Mandi.builder().name("Dhar Mandi").state("Madhya Pradesh").district("Dhar").latitude(22.5986).longitude(75.3033).address("Dhar APMC Yard, Dhar Road").build());
            mandis = mandiRepository.saveAll(mandis);
            log.info("Seeded {} Mandis", mandis.size());
        }

        // 2. Seed Commodities if empty
        List<Commodity> commodities = commodityRepository.findAll();
        if (commodities.isEmpty()) {
            commodities = new ArrayList<>();
            commodities.add(Commodity.builder().name("Wheat").category("Grains").localName("गेहूं").build());
            commodities.add(Commodity.builder().name("Paddy (Rice)").category("Grains").localName("धान").build());
            commodities.add(Commodity.builder().name("Soybean").category("Oilseeds").localName("सोयाबीन").build());
            commodities.add(Commodity.builder().name("Onion").category("Vegetables").localName("प्याज").build());
            commodities.add(Commodity.builder().name("Potato").category("Vegetables").localName("आलू").build());
            commodities.add(Commodity.builder().name("Tomato").category("Vegetables").localName("टमाटर").build());
            commodities = commodityRepository.saveAll(commodities);
            log.info("Seeded {} Commodities", commodities.size());
        }

        // 3. Seed Daily Prices (past 30 days)
        if (dailyPriceRepository.count() == 0) {
            Random rand = new Random(42); // Seeded random for reproducible prices
            LocalDate today = LocalDate.now();
            List<DailyPrice> pricesToSave = new ArrayList<>();

            // Base price config per commodity
            // Commodity -> Base price in INR/quintal
            double[] basePrices = { 2300.0, 2100.0, 4800.0, 1800.0, 1400.0, 2200.0 };

            for (int day = 30; day >= 0; day--) {
                LocalDate date = today.minusDays(day);

                for (int cIdx = 0; cIdx < commodities.size(); cIdx++) {
                    Commodity commodity = commodities.get(cIdx);
                    double basePrice = basePrices[cIdx];

                    for (int mIdx = 0; mIdx < mandis.size(); mIdx++) {
                        Mandi mandi = mandis.get(mIdx);

                        // Introduce mandi factor and daily walk variation
                        double mandiModifier = 1.0 + (mIdx - 2) * 0.02; // -4% to +4% price difference per mandi
                        double dailyFluctuation = 1.0 + (rand.nextDouble() - 0.5) * 0.05 + (Math.sin(day * 0.2) * 0.03); // random walk + seasonal wave
                        
                        double modal = basePrice * mandiModifier * dailyFluctuation;
                        double min = modal * 0.92;
                        double max = modal * 1.08;
                        double arrival = 100.0 + rand.nextDouble() * 900.0; // 100 to 1000 quintals

                        DailyPrice dp = DailyPrice.builder()
                                .mandi(mandi)
                                .commodity(commodity)
                                .minPrice(BigDecimal.valueOf(min).setScale(2, RoundingMode.HALF_UP))
                                .maxPrice(BigDecimal.valueOf(max).setScale(2, RoundingMode.HALF_UP))
                                .modalPrice(BigDecimal.valueOf(modal).setScale(2, RoundingMode.HALF_UP))
                                .arrivalVolume(BigDecimal.valueOf(arrival).setScale(2, RoundingMode.HALF_UP))
                                .priceDate(date)
                                .build();

                        pricesToSave.add(dp);
                    }
                }
            }

            dailyPriceRepository.saveAll(pricesToSave);
            log.info("Seeded {} DailyPrice records", pricesToSave.size());
        }
    }
}

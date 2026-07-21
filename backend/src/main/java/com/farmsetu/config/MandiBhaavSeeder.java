package com.farmsetu.config;

import com.farmsetu.model.entity.Commodity;
import com.farmsetu.model.entity.DailyPrice;
import com.farmsetu.model.entity.Mandi;
import com.farmsetu.repository.CommodityRepository;
import com.farmsetu.repository.DailyPriceRepository;
import com.farmsetu.repository.MandiRepository;
import com.farmsetu.repository.UserWatchlistRepository;
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
@Order(10)
public class MandiBhaavSeeder implements CommandLineRunner {

    private final MandiRepository mandiRepository;
    private final CommodityRepository commodityRepository;
    private final DailyPriceRepository dailyPriceRepository;
    private final UserWatchlistRepository userWatchlistRepository;

    @Override
    public void run(String... args) throws Exception {
        if (mandiRepository.count() > 0) {
            log.info("Mandi Bhaav data already present. Skipping automatic startup seeder.");
            return;
        }
        log.info("Mandi Bhaav seeder ready. Seeding can be performed via Admin Frontend bulk upload.");
    }
}

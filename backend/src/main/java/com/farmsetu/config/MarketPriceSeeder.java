package com.farmsetu.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmsetu.model.entity.Crop;
import com.farmsetu.model.entity.MarketPrice;
import com.farmsetu.model.enums.CropSeason;
import com.farmsetu.repository.CropRepository;
import com.farmsetu.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketPriceSeeder implements CommandLineRunner {

    private final CropRepository cropRepository;
    private final MarketPriceRepository marketPriceRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        if (marketPriceRepository.count() > 0) {
            log.info("Market prices already seeded. Skipping seeder.");
            return;
        }

        log.info("Market price seeder ready. Seeding can be performed via Admin Frontend bulk upload.");
    }

    private CropSeason getSeasonForCrop(String cropName) {
        String lower = cropName.toLowerCase();
        if (lower.contains("wheat") || lower.contains("mustard") || lower.contains("gram") || lower.contains("potato") || lower.contains("apple")) {
            return CropSeason.RABI;
        } else if (lower.contains("rice") || lower.contains("paddy") || lower.contains("maize") || lower.contains("jowar") || lower.contains("soyabean") || lower.contains("groundnut") || lower.contains("sesamum")) {
            return CropSeason.KHARIF;
        }
        return CropSeason.ZAID;
    }
}

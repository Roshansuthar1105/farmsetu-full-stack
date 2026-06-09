package com.farmsetu.config;

import com.farmsetu.model.entity.WaterSource;
import com.farmsetu.repository.WaterSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WaterSourceSeeder implements CommandLineRunner {

    private final WaterSourceRepository waterSourceRepository;

    @Override
    public void run(String... args) throws Exception {
        if (waterSourceRepository.count() > 0) {
            log.info("Water sources already seeded. Skipping.");
            return;
        }

        log.info("Seeding community water sources...");
        List<WaterSource> sources = new ArrayList<>();

        sources.add(WaterSource.builder()
                .name("Chomu Canal Lift-1")
                .type("Canal")
                .location("Chomu Irrigation Zone A, Jaipur")
                .latitude(27.1662)
                .longitude(75.7227)
                .flowRateLph(25000.0) // 25,000 L/hr
                .status("ACTIVE")
                .build());

        sources.add(WaterSource.builder()
                .name("Muhana Community Tube-well 3")
                .type("Tube-well")
                .location("Muhana Village Mandi Ground, Jaipur")
                .latitude(26.8810)
                .longitude(75.7591)
                .flowRateLph(18000.0) // 18,000 L/hr
                .status("ACTIVE")
                .build());

        sources.add(WaterSource.builder()
                .name("Jaipur North Borewell B")
                .type("Borewell")
                .location("Sikar Road Agro Cluster, Sikar/Jaipur border")
                .latitude(27.6094)
                .longitude(75.1399)
                .flowRateLph(15000.0) // 15,000 L/hr
                .status("ACTIVE")
                .build());

        sources.add(WaterSource.builder()
                .name("Bassi Panchayat Water Pond")
                .type("Pond")
                .location("Bassi Community Shared Reservoir, Bassi")
                .latitude(26.8378)
                .longitude(76.0435)
                .flowRateLph(12000.0) // 12,000 L/hr
                .status("ACTIVE")
                .build());

        waterSourceRepository.saveAll(sources);
        log.info("Successfully seeded 4 community water sources.");
    }
}

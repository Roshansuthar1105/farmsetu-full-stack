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
            log.info("Water sources already present. Skipping automatic startup seeder.");
            return;
        }
        log.info("Water source seeder ready. Seeding can be performed via Admin Frontend bulk upload.");
    }
}

package com.farmsetu.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Run before seeders
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing dynamic database updates...");
        try {
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS post_likes (" +
                "  post_id BIGINT NOT NULL," +
                "  user_id BIGINT NOT NULL," +
                "  PRIMARY KEY (post_id, user_id)" +
                ")"
            );
            log.info("Database table 'post_likes' is ready.");
        } catch (Exception e) {
            log.error("Failed to create post_likes table dynamically: {}", e.getMessage());
        }
    }
}

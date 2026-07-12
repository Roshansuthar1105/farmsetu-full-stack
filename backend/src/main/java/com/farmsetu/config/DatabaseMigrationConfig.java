package com.farmsetu.config;

import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@Slf4j
public class DatabaseMigrationConfig {

    @Autowired
    public void migrate(DataSource dataSource) {
        log.info("Running custom database migration...");
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Check if column is_ai exists on users table (check both lowercase and uppercase name for safety)
            DatabaseMetaData metaData = conn.getMetaData();
            boolean columnExists = false;
            try (ResultSet rs = metaData.getColumns(null, null, "users", "is_ai")) {
                if (rs.next()) {
                    columnExists = true;
                }
            }
            if (!columnExists) {
                try (ResultSet rs = metaData.getColumns(null, null, "USERS", "IS_AI")) {
                    if (rs.next()) {
                        columnExists = true;
                    }
                }
            }
            
            if (!columnExists) {
                log.info("Adding column 'is_ai' to 'users' table...");
                stmt.execute("ALTER TABLE users ADD COLUMN is_ai BOOLEAN NOT NULL DEFAULT FALSE");
                log.info("Column 'is_ai' added successfully.");
            } else {
                log.info("Column 'is_ai' already exists in 'users' table.");
            }

            // Seed AI Bot if not exists
            boolean botExists = false;
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users WHERE email = 'ai.assistant@farmsetu.com'")) {
                if (rs.next() && rs.getInt(1) > 0) {
                    botExists = true;
                }
            }

            if (!botExists) {
                log.info("Seeding FarmSetu AI Assistant into 'users' table...");
                stmt.execute(
                    "INSERT INTO users (name, email, phone, password_hash, role, is_verified, is_active, is_ai, bio, profile_photo) " +
                    "VALUES ('FarmSetu AI Assistant', 'ai.assistant@farmsetu.com', '9900990099', " +
                    "'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EXPERT', true, true, true, " +
                    "'Your AI Agricultural Assistant. Ask me anything about crop diseases, pest management, soil health, and market trends.', " +
                    "'https://ui-avatars.com/api/?name=AI+Assistant&background=10b981&color=fff&bold=true&rounded=true')"
                );
                log.info("FarmSetu AI Assistant seeded successfully.");
            }
        } catch (Exception e) {
            log.error("Failed to run custom database migrations: {}", e.getMessage(), e);
        }
    }
}

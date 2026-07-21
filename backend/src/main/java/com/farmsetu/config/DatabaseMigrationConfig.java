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
            
            // 1. Check & add column 'is_ai' on 'users' table
            DatabaseMetaData metaData = conn.getMetaData();
            boolean isAiColumnExists = false;
            try (ResultSet rs = metaData.getColumns(null, null, "users", "is_ai")) {
                if (rs.next()) isAiColumnExists = true;
            }
            if (!isAiColumnExists) {
                try (ResultSet rs = metaData.getColumns(null, null, "USERS", "IS_AI")) {
                    if (rs.next()) isAiColumnExists = true;
                }
            }
            if (!isAiColumnExists) {
                log.info("Adding column 'is_ai' to 'users' table...");
                stmt.execute("ALTER TABLE users ADD COLUMN is_ai BOOLEAN NOT NULL DEFAULT FALSE");
            }

            // 2. Check & create 'ai_chats' table
            log.info("Ensuring 'ai_chats' table and columns exist...");
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS ai_chats (" +
                "    id BIGSERIAL PRIMARY KEY," +
                "    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE," +
                "    bot_id INTEGER NOT NULL DEFAULT 1," +
                "    message_text TEXT," +
                "    is_from_bot BOOLEAN NOT NULL DEFAULT FALSE," +
                "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()," +
                "    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
                ")"
            );

            // Ensure updated_at exists on ai_chats if created without it
            try {
                stmt.execute("ALTER TABLE ai_chats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()");
                stmt.execute("ALTER TABLE ai_chats ADD COLUMN IF NOT EXISTS is_from_bot BOOLEAN NOT NULL DEFAULT FALSE");
            } catch (Exception ignored) {}

            // 3. Check & create 'expert_chat_sessions' table
            log.info("Ensuring 'expert_chat_sessions' table exists...");
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS expert_chat_sessions (" +
                "    id BIGSERIAL PRIMARY KEY," +
                "    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE," +
                "    expert_id BIGINT REFERENCES users(id)," +
                "    status VARCHAR(30) NOT NULL DEFAULT 'AI_ACTIVE'," +
                "    topic VARCHAR(500)," +
                "    ai_summary TEXT," +
                "    ai_message_count INTEGER NOT NULL DEFAULT 0," +
                "    escalation_reason VARCHAR(500)," +
                "    resolved_at TIMESTAMPTZ," +
                "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()," +
                "    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
                ")"
            );

            log.info("Custom database migrations completed successfully.");
        } catch (Exception e) {
            log.error("Failed to run custom database migrations: {}", e.getMessage(), e);
        }
    }
}

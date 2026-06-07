package com.farmsetu.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        try {
            // Clean up postgresql:// or postgres:// to create URI
            URI dbUri = new URI(databaseUrl);
            String userInfo = dbUri.getUserInfo();
            
            String username = "";
            String password = "";
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                password = parts[1];
            }
            
            // Reconstruct the host, port, path and query into a jdbc url
            String host = dbUri.getHost();
            int port = dbUri.getPort();
            String path = dbUri.getPath();
            String query = dbUri.getQuery();
            
            // Default port for PostgreSQL if not specified
            String portStr = (port == -1) ? "" : ":" + port;
            
            String dbUrl = "jdbc:postgresql://" + host + portStr + path;
            if (query != null && !query.isEmpty()) {
                dbUrl += "?" + query;
            }
            
            // Append SSL mode if not already present
            if (dbUrl.contains("?")) {
                if (!dbUrl.contains("sslmode=")) {
                    dbUrl += "&sslmode=require";
                }
            } else {
                dbUrl += "?sslmode=require";
            }
            
            System.out.println("Configuring Custom DataSource for Render using DATABASE_URL: " + dbUrl);
            
            return DataSourceBuilder.create()
                    .url(dbUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid DATABASE_URL environment variable format: " + databaseUrl, e);
        }
    }
}

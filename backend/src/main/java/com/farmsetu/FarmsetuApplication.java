package com.farmsetu;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class FarmsetuApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmsetuApplication.class, args);
    }
    // @Bean
    // public CommandLineRunner printEnvVariables(Environment env) {
    // return args -> {
    // System.out.println("==================================================");
    // System.out.println("ENVIRONMENT VARIABLES (System.getenv()):");
    // System.out.println("==================================================");
    // System.getenv().forEach((key, value) -> {
    // System.out.println(key + "=" + value);
    // });
    // System.out.println("==================================================");
    // System.out.println("SPRING APPLICATION PROPERTIES (Environment):");
    // System.out.println("==================================================");
    // String[] propertyKeys = {
    // "server.port",
    // "spring.datasource.url",
    // "spring.datasource.username",
    // "spring.datasource.driver-class-name",
    // "spring.jpa.hibernate.ddl-auto",
    // "farmsetu.jwt.secret",
    // "spring.mail.host",
    // "spring.mail.username",
    // "cloudinary.cloud-name"
    // };
    // for (String key : propertyKeys) {
    // System.out.println(key + " = " + env.getProperty(key));
    // }
    // System.out.println("==================================================");
    // };
    // }
}

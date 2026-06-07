package com.farmsetu.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.upload-preset:}")
    private String uploadPreset;

    @PostConstruct
    public void init() {
        if (cloudName == null || cloudName.isBlank()) {
            log.warn("Cloudinary cloud name is EMPTY. Cloudinary uploads will not work.");
        } else {
            log.info("Cloudinary REST uploader initialized: Cloud Name: [{}], Preset: [{}]", 
                     cloudName, uploadPreset);
        }
    }
}

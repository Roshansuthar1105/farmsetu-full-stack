package com.farmsetu.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.upload-preset:}")
    private String uploadPreset;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadFile(MultipartFile file) throws IOException {
        if (cloudName == null || cloudName.isBlank()) {
            throw new IllegalStateException("Cloudinary is not configured. Please set the CLOUDINARY_CLOUD_NAME environment variable.");
        }
        if (uploadPreset == null || uploadPreset.isBlank()) {
            throw new IllegalStateException("Cloudinary upload preset is not configured. Please set the CLOUDINARY_UPLOAD_PRESET environment variable.");
        }

        String url = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("upload_preset", uploadPreset);
        
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            }
        };
        body.add("file", fileResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("secure_url");
        } else {
            throw new IOException("Failed to upload image to Cloudinary. HTTP Status: " + response.getStatusCode());
        }
    }
}

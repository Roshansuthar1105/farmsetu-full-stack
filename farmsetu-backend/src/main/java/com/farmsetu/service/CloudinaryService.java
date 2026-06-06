package com.farmsetu.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired(required = false)
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured. Please set the CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.");
        }
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "farmsetu_marketplace"
        ));
        return (String) uploadResult.get("secure_url");
    }
}

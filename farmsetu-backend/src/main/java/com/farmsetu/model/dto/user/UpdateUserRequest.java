package com.farmsetu.model.dto.user;

import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRequest {
    private String name;
    private String bio;
    private String preferredLanguage;
    private Double latitude;
    private Double longitude;
    private String state;
    private String district;
    private String village;
    private List<String> currentCrops;
}

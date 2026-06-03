package com.farmsetu.model.dto.user;

import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private String profilePhoto;
    private String bio;
    private String preferredLanguage;
    private Double latitude;
    private Double longitude;
    private String state;
    private String district;
    private String village;
    private boolean verified;
    private Integer reputationScore;
    private List<String> currentCrops;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profilePhoto(user.getProfilePhoto())
                .bio(user.getBio())
                .preferredLanguage(user.getPreferredLanguage())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .state(user.getState())
                .district(user.getDistrict())
                .village(user.getVillage())
                .verified(user.isVerified())
                .reputationScore(user.getReputationScore())
                .currentCrops(user.getCurrentCrops())
                .build();
    }
}

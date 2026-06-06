package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.dto.user.UpdateUserRequest;
import com.farmsetu.model.dto.user.UserResponse;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.entity.UserBadge;
import com.farmsetu.repository.UserBadgeRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findUser(id));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = findUser(id);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getLatitude() != null) user.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) user.setLongitude(request.getLongitude());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getDistrict() != null) user.setDistrict(request.getDistrict());
        if (request.getVillage() != null) user.setVillage(request.getVillage());
        if (request.getCurrentCrops() != null) user.setCurrentCrops(request.getCurrentCrops());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = findUser(id);
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateProfilePhoto(Long id, String photoUrl) {
        User user = findUser(id);
        user.setProfilePhoto(photoUrl);
        return UserResponse.from(userRepository.save(user));
    }

    public List<UserBadge> getBadges(Long userId) {
        findUser(userId);
        return userBadgeRepository.findByUserId(userId);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}

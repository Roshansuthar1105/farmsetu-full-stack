package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.dto.badge.BadgeWithStatusResponse;
import com.farmsetu.model.dto.request.BadgeRequest;
import com.farmsetu.model.entity.Badge;
import com.farmsetu.model.entity.Farm;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.entity.UserBadge;
import com.farmsetu.repository.BadgeRepository;
import com.farmsetu.repository.EquipmentRepository;
import com.farmsetu.repository.FarmRepository;
import com.farmsetu.repository.UserBadgeRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final EquipmentRepository equipmentRepository;

    @Transactional(readOnly = true)
    public List<BadgeWithStatusResponse> getAllBadgesWithStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);

        Map<Long, UserBadge> userBadgeMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub, (b1, b2) -> b1));

        List<Farm> userFarms = farmRepository.findByUserId(userId);
        long equipmentCount = equipmentRepository.countByOwnerId(userId);

        return allBadges.stream().map(badge -> {
            UserBadge ub = userBadgeMap.get(badge.getId());
            boolean isUnlocked = ub != null;
            Instant earnedAt = isUnlocked ? ub.getEarnedAt() : null;

            int progress = calculateProgress(badge, user, userFarms, equipmentCount);
            int threshold = badge.getThresholdValue() != null ? badge.getThresholdValue() : 1;
            boolean isEligible = isUnlocked || (progress >= threshold);

            return BadgeWithStatusResponse.from(badge, isUnlocked, isEligible, earnedAt, Math.min(progress, threshold));
        }).collect(Collectors.toList());
    }

    @Transactional
    public BadgeWithStatusResponse claimBadge(Long userId, Long badgeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found: " + badgeId));

        Optional<UserBadge> existingUb = userBadgeRepository.findByUserIdAndBadgeId(userId, badgeId);
        if (existingUb.isPresent()) {
            return BadgeWithStatusResponse.from(badge, true, true, existingUb.get().getEarnedAt(), badge.getThresholdValue() != null ? badge.getThresholdValue() : 1);
        }

        List<Farm> userFarms = farmRepository.findByUserId(userId);
        long equipmentCount = equipmentRepository.countByOwnerId(userId);
        int progress = calculateProgress(badge, user, userFarms, equipmentCount);
        int threshold = badge.getThresholdValue() != null ? badge.getThresholdValue() : 1;

        if (progress < threshold) {
            throw new IllegalStateException("You have not met the criteria to unlock this badge yet.");
        }

        // Grant User Badge
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .earnedAt(Instant.now())
                .build();
        userBadgeRepository.save(userBadge);

        // Increase User Reputation Score
        int bonus = badge.getPointsRequired() != null ? badge.getPointsRequired() : 50;
        int currentRep = user.getReputationScore() != null ? user.getReputationScore() : 0;
        user.setReputationScore(currentRep + bonus);
        userRepository.save(user);

        log.info("User {} unlocked badge '{}' (+{} Rep)", user.getId(), badge.getName(), bonus);

        return BadgeWithStatusResponse.from(badge, true, true, userBadge.getEarnedAt(), threshold);
    }

    private int calculateProgress(Badge badge, User user, List<Farm> userFarms, long equipmentCount) {
        String criteria = badge.getCriteriaType();
        if (criteria == null) return 1;

        switch (criteria.toUpperCase()) {
            case "PROFILE_COMPLETE":
                return (user.getBio() != null && !user.getBio().trim().isEmpty()) ? 1 : 0;
            case "SOIL_RECORD":
                boolean hasSoil = userFarms.stream().anyMatch(f -> f.getSoilType() != null || f.getNitrogen() != null);
                return hasSoil ? 1 : 0;
            case "FARM_COUNT":
                return userFarms.size();
            case "EQUIPMENT_LEASE":
                return (int) equipmentCount;
            case "REPUTATION_THRESHOLD":
                return user.getReputationScore() != null ? user.getReputationScore() : 0;
            default:
                return 1;
        }
    }

    // Admin CRUD Operations
    @Transactional(readOnly = true)
    public Page<Badge> getAdminBadges(Pageable pageable, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return badgeRepository.findAll(pageable); // Basic search fallback
        }
        return badgeRepository.findAll(pageable);
    }

    @Transactional
    public Badge createBadge(BadgeRequest request) {
        Badge badge = Badge.builder()
                .name(request.getName())
                .hindiName(request.getHindiName())
                .description(request.getDescription())
                .hindiDescription(request.getHindiDescription())
                .iconUrl(request.getIconUrl())
                .badgeType(request.getBadgeType())
                .category(request.getCategory())
                .rarity(request.getRarity())
                .criteriaType(request.getCriteriaType())
                .thresholdValue(request.getThresholdValue())
                .gradientStyle(request.getGradientStyle())
                .pointsRequired(request.getPointsRequired())
                .build();

        return badgeRepository.save(badge);
    }

    @Transactional
    public Badge updateBadge(Long id, BadgeRequest request) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found: " + id));

        if (request.getName() != null) badge.setName(request.getName());
        if (request.getHindiName() != null) badge.setHindiName(request.getHindiName());
        if (request.getDescription() != null) badge.setDescription(request.getDescription());
        if (request.getHindiDescription() != null) badge.setHindiDescription(request.getHindiDescription());
        if (request.getIconUrl() != null) badge.setIconUrl(request.getIconUrl());
        if (request.getBadgeType() != null) badge.setBadgeType(request.getBadgeType());
        if (request.getCategory() != null) badge.setCategory(request.getCategory());
        if (request.getRarity() != null) badge.setRarity(request.getRarity());
        if (request.getCriteriaType() != null) badge.setCriteriaType(request.getCriteriaType());
        if (request.getThresholdValue() != null) badge.setThresholdValue(request.getThresholdValue());
        if (request.getGradientStyle() != null) badge.setGradientStyle(request.getGradientStyle());
        if (request.getPointsRequired() != null) badge.setPointsRequired(request.getPointsRequired());

        return badgeRepository.save(badge);
    }

    @Transactional
    public void deleteBadge(Long id) {
        if (!badgeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Badge not found: " + id);
        }
        badgeRepository.deleteById(id);
    }
}

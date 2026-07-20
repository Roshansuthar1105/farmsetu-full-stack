package com.farmsetu.repository;

import com.farmsetu.model.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
    Optional<UserBadge> findByUserIdAndBadgeId(Long userId, Long badgeId);
}


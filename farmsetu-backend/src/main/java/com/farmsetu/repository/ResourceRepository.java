package com.farmsetu.repository;

import com.farmsetu.model.entity.Resource;
import com.farmsetu.model.enums.DifficultyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    Page<Resource> findByCropType(String cropType, Pageable pageable);
    Page<Resource> findByDifficultyLevel(DifficultyLevel level, Pageable pageable);
}

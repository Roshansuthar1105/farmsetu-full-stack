package com.farmsetu.repository;

import com.farmsetu.model.entity.DiseaseDetection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiseaseDetectionRepository extends JpaRepository<DiseaseDetection, Long> {
    Page<DiseaseDetection> findByFarmerId(Long farmerId, Pageable pageable);
}

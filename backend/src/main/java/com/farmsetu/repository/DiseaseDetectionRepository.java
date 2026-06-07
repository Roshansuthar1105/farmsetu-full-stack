package com.farmsetu.repository;

import com.farmsetu.model.entity.DiseaseDetection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiseaseDetectionRepository extends JpaRepository<DiseaseDetection, Long> {
    List<DiseaseDetection> findByFarmerIdOrderByCreatedAtDesc(Long farmerId, Pageable pageable);
}



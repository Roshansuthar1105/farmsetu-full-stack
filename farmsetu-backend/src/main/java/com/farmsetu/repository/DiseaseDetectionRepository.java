package com.farmsetu.repository;

import com.farmsetu.model.entity.DiseaseDetection;


import org.springframework.data.jpa.repository.JpaRepository;

public interface DiseaseDetectionRepository extends JpaRepository<DiseaseDetection, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM disease_detections WHERE farmer_id = :farmerId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByFarmerIdNative(@org.springframework.data.repository.query.Param("farmerId") Long farmerId, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



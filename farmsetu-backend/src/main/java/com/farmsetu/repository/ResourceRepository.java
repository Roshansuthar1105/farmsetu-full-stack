package com.farmsetu.repository;

import com.farmsetu.model.entity.Resource;
import com.farmsetu.model.enums.DifficultyLevel;


import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM resources WHERE crop_type = :cropType LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByCropTypeNative(@org.springframework.data.repository.query.Param("cropType") String cropType, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM resources WHERE difficulty_level = :#{#level.name()} LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByDifficultyLevelNative(@org.springframework.data.repository.query.Param("level") DifficultyLevel level, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM resources LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



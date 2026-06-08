package com.farmsetu.repository;

import com.farmsetu.model.entity.Crop;
import com.farmsetu.model.enums.CropSeason;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findBySeason(CropSeason season);
    java.util.Optional<Crop> findByNameIgnoreCase(String name);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM crops LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



package com.farmsetu.repository;

import com.farmsetu.model.entity.Crop;
import com.farmsetu.model.enums.CropSeason;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findBySeason(CropSeason season);
}

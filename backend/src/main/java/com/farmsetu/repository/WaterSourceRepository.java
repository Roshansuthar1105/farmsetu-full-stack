package com.farmsetu.repository;

import com.farmsetu.model.entity.WaterSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaterSourceRepository extends JpaRepository<WaterSource, Long> {
    List<WaterSource> findByStatus(String status);
}

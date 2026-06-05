package com.farmsetu.repository;

import com.farmsetu.model.entity.CropCalendar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropCalendarRepository extends JpaRepository<CropCalendar, Long> {
    List<CropCalendar> findByFarmerId(Long farmerId);
}



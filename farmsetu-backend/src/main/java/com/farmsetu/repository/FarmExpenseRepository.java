package com.farmsetu.repository;

import com.farmsetu.model.entity.FarmExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmExpenseRepository extends JpaRepository<FarmExpense, Long> {
    List<FarmExpense> findByFarmerId(Long farmerId);
    List<FarmExpense> findByFarmerIdAndSeasonAndYear(Long farmerId, String season, Integer year);
}

package com.farmsetu.repository;

import com.farmsetu.model.entity.MarketPrice;


import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM market_prices WHERE crop_id = :cropId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByCropIdNative(@org.springframework.data.repository.query.Param("cropId") Long cropId, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
    List<MarketPrice> findByCropIdAndRecordedDateBetween(Long cropId, LocalDate from, LocalDate to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM market_prices LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



package com.farmsetu.repository;

import com.farmsetu.model.entity.MarketPrice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    List<MarketPrice> findByCropId(Long cropId, Pageable pageable);
    List<MarketPrice> findByCropIdAndRecordedDateBetween(Long cropId, LocalDate from, LocalDate to);
}



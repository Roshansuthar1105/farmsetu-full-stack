package com.farmsetu.repository;

import com.farmsetu.model.entity.StockLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockLogRepository extends JpaRepository<StockLog, Long> {
    List<StockLog> findByProductIdOrderByCreatedAtDesc(Long productId);
}

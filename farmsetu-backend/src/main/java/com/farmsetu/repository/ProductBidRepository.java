package com.farmsetu.repository;

import com.farmsetu.model.entity.ProductBid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductBidRepository extends JpaRepository<ProductBid, Long> {
    List<ProductBid> findByProductIdOrderByAmountDesc(Long productId);
}

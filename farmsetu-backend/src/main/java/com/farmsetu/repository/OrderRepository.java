package com.farmsetu.repository;

import com.farmsetu.model.entity.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerId(Long buyerId, Pageable pageable);

    List<Order> findBySellerId(Long sellerId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.seller JOIN FETCH o.product p JOIN FETCH p.seller")
    List<Order> findAllWithRelations(Pageable pageable);
}

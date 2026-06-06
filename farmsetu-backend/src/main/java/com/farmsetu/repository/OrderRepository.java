package com.farmsetu.repository;

import com.farmsetu.model.entity.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.seller JOIN FETCH o.product p JOIN FETCH p.seller WHERE o.buyer.id = :buyerId")
    List<Order> findByBuyerIdWithRelations(@Param("buyerId") Long buyerId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.seller JOIN FETCH o.product p JOIN FETCH p.seller WHERE o.seller.id = :sellerId")
    List<Order> findBySellerIdWithRelations(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.seller JOIN FETCH o.product p JOIN FETCH p.seller")
    List<Order> findAllWithRelations(Pageable pageable);
}

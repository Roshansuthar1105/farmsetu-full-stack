package com.farmsetu.repository;

import com.farmsetu.model.entity.Order;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

            @Query(value = "SELECT * FROM orders WHERE buyer_id = :buyerId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByBuyerIdNative(
            @Param("buyerId") Long buyerId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query(value = "SELECT * FROM orders WHERE seller_id = :sellerId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findBySellerIdNative(
            @Param("sellerId") Long sellerId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query(value = "SELECT * FROM orders LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(
            @Param("limit") int limit,
            @Param("offset") int offset);
}

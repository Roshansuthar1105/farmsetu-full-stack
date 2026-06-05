package com.farmsetu.repository;

import com.farmsetu.model.entity.Review;


import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM reviews WHERE product_id = :productId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByProductIdNative(@org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



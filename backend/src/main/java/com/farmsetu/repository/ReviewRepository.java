package com.farmsetu.repository;

import com.farmsetu.model.entity.Review;


import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT r.*, u.name as reviewerName FROM reviews r LEFT JOIN users u ON r.reviewer_id = u.id WHERE r.product_id = :productId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByProductIdNative(@org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    java.util.Optional<Review> findByProductIdAndReviewerId(Long productId, Long reviewerId);

    java.util.List<Review> findByProductId(Long productId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id = :productId GROUP BY r.rating")
    java.util.List<Object[]> countReviewsGroupByRating(@org.springframework.data.repository.query.Param("productId") Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingForProduct(@org.springframework.data.repository.query.Param("productId") Long productId);
}



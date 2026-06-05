package com.farmsetu.repository;

import com.farmsetu.model.entity.Product;
import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductStatus;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    @Query(nativeQuery = true, value = "SELECT * FROM product WHERE status = :#{#status.name()} LIMIT :limit OFFSET :offset")
    List<Map<String, Object>> findByStatusNative(@Param("status") ProductStatus status, @Param("limit") int limit, @Param("offset") int offset);
    
    @Query(nativeQuery = true, value = "SELECT * FROM product WHERE category = :#{#category.name()} AND status = :#{#status.name()} LIMIT :limit OFFSET :offset")
    List<Map<String, Object>> findByCategoryAndStatusNative(@Param("category") ProductCategory category, @Param("status") ProductStatus status, @Param("limit") int limit, @Param("offset") int offset);
    
    @Query(nativeQuery = true, value = "SELECT * FROM product WHERE seller_id = :sellerId AND status = :#{#status.name()} LIMIT :limit OFFSET :offset")
    List<Map<String, Object>> findBySellerIdAndStatusNative(@Param("sellerId") Long sellerId, @Param("status") ProductStatus status, @Param("limit") int limit, @Param("offset") int offset);

    @Query(nativeQuery = true, value = "SELECT * FROM product LIMIT :limit OFFSET :offset")
    List<Map<String, Object>> findAllNative(@Param("limit") int limit, @Param("offset") int offset);

    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);
}


package com.farmsetu.repository;

import com.farmsetu.model.entity.Product;
import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.status = :status")
    List<Product> findByStatus(@Param("status") ProductStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.category = :category AND p.status = :status")
    List<Product> findByCategoryAndStatus(@Param("category") ProductCategory category, @Param("status") ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.status = :status AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findByStatusAndSearch(@Param("status") ProductStatus status, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.category = :category AND p.status = :status AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findByCategoryAndStatusAndSearch(@Param("category") ProductCategory category, @Param("status") ProductStatus status, @Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.seller.id = :sellerId AND p.status = :status")
    List<Product> findBySellerIdAndStatus(@Param("sellerId") Long sellerId, @Param("status") ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller")
    List<Product> findAllWithSeller(Pageable pageable);

    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);
}


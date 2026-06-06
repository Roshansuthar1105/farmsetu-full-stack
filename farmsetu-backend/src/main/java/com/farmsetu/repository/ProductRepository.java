package com.farmsetu.repository;

import com.farmsetu.model.entity.Product;
import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :qty WHERE p.id = :productId AND p.stock >= :qty")
    int deductStock(@Param("productId") Long productId, @Param("qty") int qty);

    @Query("SELECT p, COALESCE(AVG(r.rating), 0.0) as avgRating, COUNT(r) as reviewCount " +
           "FROM Product p LEFT JOIN Review r ON r.product = p " +
           "WHERE p.status = 'ACTIVE' " +
           "AND (cast(:category as string) IS NULL OR p.category = :category) " +
           "AND (cast(:search as string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (cast(:stockStatus as string) IS NULL OR p.stockStatus = :stockStatus) " +
           "GROUP BY p.id, p.seller.id " +
           "HAVING (:minRating IS NULL OR COALESCE(AVG(r.rating), 0.0) >= :minRating)")
    List<Object[]> searchProducts(
            @Param("category") ProductCategory category,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("stockStatus") com.farmsetu.model.enums.StockStatus stockStatus,
            @Param("minRating") Double minRating,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :qty WHERE p.id = :productId")
    int restoreStock(@Param("productId") Long productId, @Param("qty") int qty);
}


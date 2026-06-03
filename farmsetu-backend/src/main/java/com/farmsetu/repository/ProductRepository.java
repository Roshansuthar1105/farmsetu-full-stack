package com.farmsetu.repository;

import com.farmsetu.model.entity.Product;
import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    Page<Product> findByCategoryAndStatus(ProductCategory category, ProductStatus status, Pageable pageable);
    Page<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);
}

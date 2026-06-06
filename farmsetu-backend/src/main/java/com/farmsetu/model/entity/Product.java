package com.farmsetu.model.entity;

import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductCondition;
import com.farmsetu.model.enums.ProductStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "images", "seller"})
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private Integer quantity;

    private String unit;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductCondition condition = ProductCondition.NEW;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String location;

    @Column(name = "is_auction")
    @Builder.Default
    private boolean auction = false;

    @Column(name = "auction_end_time")
    private Instant auctionEndTime;

    @Column(name = "current_bid", precision = 12, scale = 2)
    private BigDecimal currentBid;

    @Column(name = "starting_bid", precision = 12, scale = 2)
    private BigDecimal startingBid;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "stock")
    @Builder.Default
    private Integer stock = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status")
    @Builder.Default
    private com.farmsetu.model.enums.StockStatus stockStatus = com.farmsetu.model.enums.StockStatus.IN_STOCK;

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 10;
}


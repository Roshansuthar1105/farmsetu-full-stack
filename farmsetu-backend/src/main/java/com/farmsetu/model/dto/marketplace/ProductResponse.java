package com.farmsetu.model.dto.marketplace;

import com.farmsetu.model.entity.Product;
import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductCondition;
import com.farmsetu.model.enums.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private Long sellerId;
    private String sellerName;
    private String title;
    private String description;
    private ProductCategory category;
    private BigDecimal price;
    private Integer quantity;
    private Integer stock;
    private String stockStatus;
    private Integer lowStockThreshold;
    private String unit;
    private ProductCondition condition;
    private List<String> images;
    private String location;
    private boolean auction;
    private Instant auctionEndTime;
    private BigDecimal currentBid;
    private BigDecimal startingBid;
    private ProductStatus status;
    private Double averageRating;
    private Integer totalReviews;
    private java.util.Map<Integer, Integer> starDistribution;

    public static ProductResponse from(Product product) {
        return from(product, null, null, null);
    }

    public static ProductResponse from(Product product, Double averageRating, Integer totalReviews, java.util.Map<Integer, Integer> starDistribution) {
        return ProductResponse.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getName())
                .title(product.getTitle())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .stock(product.getStock())
                .stockStatus(product.getStockStatus() != null ? product.getStockStatus().name() : null)
                .lowStockThreshold(product.getLowStockThreshold())
                .unit(product.getUnit())
                .condition(product.getCondition())
                .images(product.getImages() != null ? new java.util.ArrayList<>(product.getImages()) : new java.util.ArrayList<>())
                .location(product.getLocation())
                .auction(product.isAuction())
                .auctionEndTime(product.getAuctionEndTime())
                .currentBid(product.getCurrentBid())
                .startingBid(product.getStartingBid())
                .status(product.getStatus())
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .starDistribution(starDistribution)
                .build();
    }
}

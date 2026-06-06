package com.farmsetu.model.dto.marketplace;

import com.farmsetu.model.enums.ProductCategory;
import com.farmsetu.model.enums.ProductCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private ProductCategory category;
    @NotNull
    private BigDecimal price;
    private Integer quantity; // Keep quantity for backward compatibility
    private Integer stock;
    private Integer lowStockThreshold;
    private String unit;
    private ProductCondition condition;
    private List<String> images;
    private String location;
    private boolean auction;
    private Instant auctionEndTime;
    private BigDecimal startingBid;
}

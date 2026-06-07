package com.farmsetu.model.dto.marketplace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private BigDecimal productPrice;
    private String productImage;
    private Integer requestedQuantity;
    private Integer availableStock;
    private String stockStatus; // e.g. IN_STOCK, LOW_STOCK, OUT_OF_STOCK
    private String warning; // e.g. NONE, OUT_OF_STOCK, INSUFFICIENT_STOCK, LOW_STOCK
}

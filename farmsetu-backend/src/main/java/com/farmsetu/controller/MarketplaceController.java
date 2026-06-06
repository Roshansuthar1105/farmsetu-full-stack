package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.marketplace.ProductRequest;
import com.farmsetu.model.dto.marketplace.ProductResponse;
import com.farmsetu.model.entity.Order;
import com.farmsetu.model.entity.ProductBid;
import com.farmsetu.model.entity.Review;
import com.farmsetu.model.enums.DeliveryStatus;
import com.farmsetu.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/products")
    public ApiResponse<java.util.List<ProductResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketplaceService.listProducts(category, search, page, size));
    }

    @PostMapping("/products")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(marketplaceService.createProduct(request));
    }

    @GetMapping("/products/{id}")
    public ApiResponse<ProductResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(marketplaceService.getProduct(id));
    }

    @PutMapping("/products/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(marketplaceService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        marketplaceService.deleteProduct(id);
        return ApiResponse.ok("Product removed", null);
    }

    @GetMapping("/products/category/{category}")
    public ApiResponse<java.util.List<ProductResponse>> byCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketplaceService.listByCategory(category, page, size));
    }

    @PostMapping("/products/{id}/bids")
    public ApiResponse<ProductBid> bid(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        return ApiResponse.ok(marketplaceService.placeBid(id, body.get("amount")));
    }

    @GetMapping("/products/{id}/bids")
    public ApiResponse<java.util.List<ProductBid>> bids(@PathVariable Long id) {
        return ApiResponse.ok(marketplaceService.getBids(id));
    }

    @PostMapping("/orders")
    public ApiResponse<Order> createOrder(@RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = Integer.parseInt(body.get("quantity").toString());
        String address = (String) body.get("deliveryAddress");
        return ApiResponse.ok(marketplaceService.createOrder(productId, quantity, address));
    }

    @GetMapping("/orders/{id}")
    public ApiResponse<Order> getOrder(@PathVariable Long id) {
        return ApiResponse.ok(marketplaceService.getOrder(id));
    }

    @PutMapping("/orders/{id}/status")
    public ApiResponse<Order> updateStatus(@PathVariable Long id, @RequestParam DeliveryStatus status) {
        return ApiResponse.ok(marketplaceService.updateOrderStatus(id, status));
    }

    @PostMapping("/products/{id}/review")
    public ApiResponse<Review> review(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(marketplaceService.addReview(
                id, Integer.parseInt(body.get("rating").toString()), (String) body.get("reviewText")));
    }

    @GetMapping("/products/{id}/reviews")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> reviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketplaceService.getReviews(id, page, size));
    }

    @GetMapping("/seller/{id}/products")
    public ApiResponse<java.util.List<ProductResponse>> sellerProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketplaceService.sellerProducts(id, page, size));
    }
}

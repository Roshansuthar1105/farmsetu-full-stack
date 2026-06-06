package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.marketplace.ProductRequest;
import com.farmsetu.model.dto.marketplace.ProductResponse;
import com.farmsetu.model.dto.marketplace.CartResponse;
import com.farmsetu.model.dto.marketplace.CartItemResponse;
import com.farmsetu.model.entity.Order;
import com.farmsetu.model.entity.ProductBid;
import com.farmsetu.model.entity.Review;
import com.farmsetu.model.entity.CartItem;
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
import org.springframework.web.multipart.MultipartFile;

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
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(marketplaceService.listProducts(category, search, minPrice, maxPrice, minRating, stockStatus, sortBy, page, size));
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
        String reviewText = body.containsKey("comment") ? (String) body.get("comment") : (String) body.get("reviewText");
        return ApiResponse.ok(marketplaceService.addReview(
                id, Integer.parseInt(body.get("rating").toString()), reviewText));
    }

    @PutMapping("/reviews/{reviewId}")
    public ApiResponse<Review> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> body) {
        String reviewText = body.containsKey("comment") ? (String) body.get("comment") : (String) body.get("reviewText");
        return ApiResponse.ok(marketplaceService.updateReview(
                reviewId, Integer.parseInt(body.get("rating").toString()), reviewText));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ApiResponse<Void> deleteReview(@PathVariable Long reviewId) {
        marketplaceService.deleteReview(reviewId);
        return ApiResponse.ok("Review deleted", null);
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

    // Cart Endpoints
    @GetMapping("/cart")
    public ApiResponse<CartResponse> getCart() {
        return ApiResponse.ok(marketplaceService.getCart());
    }

    @PostMapping("/cart")
    public ApiResponse<CartItem> addToCart(@RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Integer quantity = Integer.parseInt(body.get("quantity").toString());
        return ApiResponse.ok(marketplaceService.addToCart(productId, quantity));
    }

    @PutMapping("/cart/{productId}")
    public ApiResponse<CartItem> updateCartQuantity(@PathVariable Long productId, @RequestBody Map<String, Object> body) {
        Integer quantity = Integer.parseInt(body.get("quantity").toString());
        return ApiResponse.ok(marketplaceService.updateCartQuantity(productId, quantity));
    }

    @DeleteMapping("/cart/{productId}")
    public ApiResponse<Void> removeFromCart(@PathVariable Long productId) {
        marketplaceService.removeFromCart(productId);
        return ApiResponse.ok("Removed from cart", null);
    }

    @PostMapping("/cart/checkout")
    public ApiResponse<java.util.List<Order>> checkout(@RequestBody Map<String, String> body) {
        String deliveryAddress = body.get("deliveryAddress");
        return ApiResponse.ok(marketplaceService.checkout(deliveryAddress));
    }

    // Order History Endpoints (Buyer & Seller)
    @GetMapping("/orders/buyer")
    public ApiResponse<java.util.List<Order>> getBuyerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = com.farmsetu.security.SecurityUtils.currentUserId();
        return ApiResponse.ok(marketplaceService.getBuyerOrders(currentUserId, page, size));
    }

    @GetMapping("/orders/seller")
    public ApiResponse<java.util.List<Order>> getSellerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = com.farmsetu.security.SecurityUtils.currentUserId();
        return ApiResponse.ok(marketplaceService.getSellerOrders(currentUserId, page, size));
    }

    // Multi-Image Upload Endpoint
    @PostMapping("/products/upload")
    public ApiResponse<java.util.List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        java.util.List<String> urls = new java.util.ArrayList<>();
        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(uploadPath);
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }
                if (file.getSize() > 5 * 1024 * 1024) {
                    throw new com.farmsetu.exception.BadRequestException("File size exceeds the 5MB limit.");
                }
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    throw new com.farmsetu.exception.BadRequestException("Only image files are allowed.");
                }
                
                String originalFilename = file.getOriginalFilename();
                String ext = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    ext = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                
                String newFilename = java.util.UUID.randomUUID().toString() + ext;
                java.nio.file.Path targetFile = uploadPath.resolve(newFilename);
                java.nio.file.Files.copy(file.getInputStream(), targetFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                urls.add("D:/new project f/farmsetu-backend/uploads" + newFilename);
            }
        } catch (java.io.IOException e) {
            throw new com.farmsetu.exception.BadRequestException("Failed to upload files: " + e.getMessage());
        }
        return ApiResponse.ok(urls);
    }
}

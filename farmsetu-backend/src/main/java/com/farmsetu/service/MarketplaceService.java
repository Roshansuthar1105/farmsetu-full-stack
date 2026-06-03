package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.dto.common.PageResponse;
import com.farmsetu.model.dto.marketplace.ProductRequest;
import com.farmsetu.model.dto.marketplace.ProductResponse;
import com.farmsetu.model.entity.Order;
import com.farmsetu.model.entity.Product;
import com.farmsetu.model.entity.ProductBid;
import com.farmsetu.model.entity.Review;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.DeliveryStatus;
import com.farmsetu.model.enums.ProductStatus;
import com.farmsetu.repository.OrderRepository;
import com.farmsetu.repository.ProductBidRepository;
import com.farmsetu.repository.ProductRepository;
import com.farmsetu.repository.ReviewRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductBidRepository productBidRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public PageResponse<ProductResponse> listProducts(int page, int size) {
        Page<Product> products = productRepository.findByStatus(ProductStatus.ACTIVE, PageRequest.of(page, size));
        return PageResponse.from(products.map(ProductResponse::from));
    }

    public PageResponse<ProductResponse> listByCategory(String category, int page, int size) {
        Page<Product> products = productRepository.findByCategoryAndStatus(
                com.farmsetu.model.enums.ProductCategory.valueOf(category),
                ProductStatus.ACTIVE,
                PageRequest.of(page, size));
        return PageResponse.from(products.map(ProductResponse::from));
    }

    public ProductResponse getProduct(Long id) {
        return ProductResponse.from(findProduct(id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        User seller = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = Product.builder()
                .seller(seller)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .condition(request.getCondition())
                .images(request.getImages())
                .location(request.getLocation())
                .auction(request.isAuction())
                .auctionEndTime(request.getAuctionEndTime())
                .startingBid(request.getStartingBid())
                .currentBid(request.getStartingBid())
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setUnit(request.getUnit());
        product.setCondition(request.getCondition());
        if (request.getImages() != null) product.setImages(request.getImages());
        product.setLocation(request.getLocation());
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        product.setStatus(ProductStatus.CANCELLED);
        productRepository.save(product);
    }

    @Transactional
    public ProductBid placeBid(Long productId, BigDecimal amount) {
        Product product = findProduct(productId);
        User bidder = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ProductBid bid = ProductBid.builder()
                .product(product)
                .bidder(bidder)
                .amount(amount)
                .build();
        product.setCurrentBid(amount);
        productRepository.save(product);
        return productBidRepository.save(bid);
    }

    public List<ProductBid> getBids(Long productId) {
        return productBidRepository.findByProductIdOrderByAmountDesc(productId);
    }

    @Transactional
    public Order createOrder(Long productId, int quantity, String deliveryAddress) {
        Product product = findProduct(productId);
        User buyer = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        Order order = Order.builder()
                .buyer(buyer)
                .seller(product.getSeller())
                .product(product)
                .quantity(quantity)
                .totalAmount(total)
                .deliveryAddress(deliveryAddress)
                .deliveryStatus(DeliveryStatus.PENDING)
                .build();
        return orderRepository.save(order);
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Transactional
    public Order updateOrderStatus(Long id, DeliveryStatus status) {
        Order order = getOrder(id);
        order.setDeliveryStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Review addReview(Long productId, Integer rating, String text) {
        Product product = findProduct(productId);
        User reviewer = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reviewRepository.save(Review.builder()
                .product(product)
                .reviewer(reviewer)
                .reviewedUser(product.getSeller())
                .rating(rating)
                .reviewText(text)
                .build());
    }

    public Page<Review> getReviews(Long productId, int page, int size) {
        return reviewRepository.findByProductId(productId, PageRequest.of(page, size));
    }

    public PageResponse<ProductResponse> sellerProducts(Long sellerId, int page, int size) {
        Page<Product> products = productRepository.findBySellerIdAndStatus(
                sellerId, ProductStatus.ACTIVE, PageRequest.of(page, size));
        return PageResponse.from(products.map(ProductResponse::from));
    }

    public Map<String, Object> sellerAnalytics(Long sellerId) {
        long activeProducts = productRepository.findBySellerIdAndStatus(
                sellerId, ProductStatus.ACTIVE, PageRequest.of(0, 1)).getTotalElements();
        return Map.of("activeProducts", activeProducts);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}

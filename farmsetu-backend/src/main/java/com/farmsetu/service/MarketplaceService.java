package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.util.EnumUtils;
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
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<ProductResponse> listProducts(String category, String search, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        List<Product> products;
        
        com.farmsetu.model.enums.ProductCategory parsedCategory = null;
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            parsedCategory = EnumUtils.parseEnum(com.farmsetu.model.enums.ProductCategory.class, category);
        }

        boolean hasSearch = search != null && !search.isBlank();

        if (parsedCategory != null) {
            if (hasSearch) {
                products = productRepository.findByCategoryAndStatusAndSearch(parsedCategory, ProductStatus.ACTIVE, search, pageable);
            } else {
                products = productRepository.findByCategoryAndStatus(parsedCategory, ProductStatus.ACTIVE, pageable);
            }
        } else {
            if (hasSearch) {
                products = productRepository.findByStatusAndSearch(ProductStatus.ACTIVE, search, pageable);
            } else {
                products = productRepository.findByStatus(ProductStatus.ACTIVE, pageable);
            }
        }
        return products.stream().map(ProductResponse::from).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listByCategory(String category, int page, int size) {
        List<Product> products = productRepository.findByCategoryAndStatus(
                EnumUtils.parseEnum(com.farmsetu.model.enums.ProductCategory.class, category),
                ProductStatus.ACTIVE,
                org.springframework.data.domain.PageRequest.of(page, size));
        return products.stream().map(ProductResponse::from).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
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

        List<ProductBid> existingBids = productBidRepository.findByProductIdOrderByAmountDesc(productId);
        if (!existingBids.isEmpty()) {
            ProductBid highestBid = existingBids.get(0);
            User prevBidder = highestBid.getBidder();
            if (prevBidder != null && prevBidder.getEmail() != null && !prevBidder.getEmail().isBlank() 
                    && !prevBidder.getId().equals(bidder.getId())) {
                emailService.sendSimpleEmail(prevBidder.getEmail(), 
                    "You've been outbid on " + product.getTitle() + "! 📣",
                    "Hello " + prevBidder.getName() + ",\n\n" +
                    "Someone placed a higher bid of ₹" + amount + " on '" + product.getTitle() + "'.\n" +
                    "Your bid of ₹" + highestBid.getAmount() + " is no longer the highest.\n\n" +
                    "Go to the marketplace to place a new bid if you don't want to miss out!\n\n" +
                    "Best regards,\nThe Farmsetu Team");
            }
        }

        ProductBid bid = ProductBid.builder()
                .product(product)
                .bidder(bidder)
                .amount(amount)
                .build();
        product.setCurrentBid(amount);
        productRepository.save(product);
        return productBidRepository.save(bid);
    }

    @Transactional(readOnly = true)
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

        Order savedOrder = orderRepository.save(order);

        if (buyer.getEmail() != null && !buyer.getEmail().isBlank()) {
            emailService.sendSimpleEmail(buyer.getEmail(), 
                "Order Confirmed: " + product.getTitle() + "! 📦",
                "Hello " + buyer.getName() + ",\n\n" +
                "Your order has been placed successfully!\n" +
                "Product: " + product.getTitle() + "\n" +
                "Quantity: " + quantity + " " + (product.getUnit() != null ? product.getUnit() : "unit(s)") + "\n" +
                "Total Price: ₹" + total + "\n" +
                "Delivery Address: " + deliveryAddress + "\n\n" +
                "Thank you for shopping on Farmsetu!\n\n" +
                "Best regards,\nThe Farmsetu Team");
        }

        User seller = product.getSeller();
        if (seller != null && seller.getEmail() != null && !seller.getEmail().isBlank()) {
            emailService.sendSimpleEmail(seller.getEmail(), 
                "New Order Received: " + product.getTitle() + "! 🔔",
                "Hello " + seller.getName() + ",\n\n" +
                "You have received a new order for '" + product.getTitle() + "'.\n" +
                "Quantity: " + quantity + " " + (product.getUnit() != null ? product.getUnit() : "unit(s)") + "\n" +
                "Total Earnings: ₹" + total + "\n" +
                "Delivery Address: " + deliveryAddress + "\n\n" +
                "Please prepare the items for delivery.\n\n" +
                "Best regards,\nThe Farmsetu Team");
        }

        return savedOrder;
    }

    @Transactional(readOnly = true)
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

    public List<Map<String, Object>> getReviews(Long productId, int page, int size) {
        return reviewRepository.findByProductIdNative(productId, size, page * size);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> sellerProducts(Long sellerId, int page, int size) {
        List<Product> products = productRepository.findBySellerIdAndStatus(
                sellerId, ProductStatus.ACTIVE, org.springframework.data.domain.PageRequest.of(page, size));
        return products.stream().map(ProductResponse::from).collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Object> sellerAnalytics(Long sellerId) {
        long activeProducts = productRepository.countBySellerIdAndStatus(sellerId, ProductStatus.ACTIVE);
        return Map.of("activeProducts", activeProducts);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}

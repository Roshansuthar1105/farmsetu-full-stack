package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.exception.BadRequestException;
import com.farmsetu.util.EnumUtils;
import com.farmsetu.model.dto.marketplace.ProductRequest;
import com.farmsetu.model.dto.marketplace.ProductResponse;
import com.farmsetu.model.dto.marketplace.CartItemResponse;
import com.farmsetu.model.dto.marketplace.CartResponse;
import com.farmsetu.model.entity.Order;
import com.farmsetu.model.entity.Product;
import com.farmsetu.model.entity.ProductBid;
import com.farmsetu.model.entity.Review;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.entity.CartItem;
import com.farmsetu.model.entity.StockLog;
import com.farmsetu.model.enums.DeliveryStatus;
import com.farmsetu.model.enums.ProductStatus;
import com.farmsetu.model.enums.StockStatus;
import com.farmsetu.repository.OrderRepository;
import com.farmsetu.repository.ProductBidRepository;
import com.farmsetu.repository.ProductRepository;
import com.farmsetu.repository.ReviewRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.repository.StockLogRepository;
import com.farmsetu.repository.CartItemRepository;
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
    private final StockLogRepository stockLogRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> listProducts(String category, String search, int page, int size) {
        return listProducts(category, search, null, null, null, null, "newest", page, size);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listProducts(String category, String search, BigDecimal minPrice, BigDecimal maxPrice, Double minRating, String stockStatus, String sortBy, int page, int size) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by("createdAt").descending(); // default newest
        if (sortBy != null && !sortBy.isBlank()) {
            switch (sortBy.toLowerCase()) {
                case "price_asc":
                case "price-asc":
                case "price-low-to-high":
                    sort = org.springframework.data.domain.Sort.by("price").ascending();
                    break;
                case "price_desc":
                case "price-desc":
                case "price-high-to-low":
                    sort = org.springframework.data.domain.Sort.by("price").descending();
                    break;
                case "newest":
                    sort = org.springframework.data.domain.Sort.by("createdAt").descending();
                    break;
                case "popular":
                case "most-popular":
                    sort = org.springframework.data.domain.Sort.by("createdAt").descending();
                    break;
            }
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);

        com.farmsetu.model.enums.ProductCategory parsedCategory = null;
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            parsedCategory = EnumUtils.parseEnum(com.farmsetu.model.enums.ProductCategory.class, category);
        }

        com.farmsetu.model.enums.StockStatus parsedStockStatus = null;
        if (stockStatus != null && !stockStatus.isBlank() && !stockStatus.equalsIgnoreCase("ALL")) {
            parsedStockStatus = EnumUtils.parseEnum(com.farmsetu.model.enums.StockStatus.class, stockStatus);
        }

        String searchPattern = (search != null && !search.isBlank()) ? search : null;

        List<Object[]> results = productRepository.searchProducts(
                parsedCategory,
                searchPattern,
                minPrice,
                maxPrice,
                parsedStockStatus,
                minRating,
                pageable
        );

        return results.stream().map(row -> {
            Product p = (Product) row[0];
            Double avgRating = (Double) row[1];
            Long totalReviews = (Long) row[2];
            return ProductResponse.from(p, avgRating, totalReviews.intValue(), null);
        }).collect(java.util.stream.Collectors.toList());
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
        Product product = findProduct(id);
        
        Double avgRating = reviewRepository.getAverageRatingForProduct(id);
        if (avgRating == null) {
            avgRating = 0.0;
        }
        
        List<Object[]> starCounts = reviewRepository.countReviewsGroupByRating(id);
        Map<Integer, Integer> starDistribution = new java.util.HashMap<>();
        for (int i = 1; i <= 5; i++) {
            starDistribution.put(i, 0);
        }
        int totalReviews = 0;
        for (Object[] row : starCounts) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            if (rating != null && rating >= 1 && rating <= 5) {
                starDistribution.put(rating, count.intValue());
                totalReviews += count.intValue();
            }
        }
        
        return ProductResponse.from(product, avgRating, totalReviews, starDistribution);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        User seller = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Integer initialStock = request.getStock() != null ? request.getStock() : (request.getQuantity() != null ? request.getQuantity() : 0);
        Product product = Product.builder()
                .seller(seller)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity() != null ? request.getQuantity() : initialStock)
                .stock(initialStock)
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .unit(request.getUnit())
                .condition(request.getCondition())
                .images(request.getImages())
                .location(request.getLocation())
                .auction(request.isAuction())
                .auctionEndTime(request.getAuctionEndTime())
                .startingBid(request.getStartingBid())
                .currentBid(request.getStartingBid())
                .build();

        updateStockStatus(product);
        Product savedProduct = productRepository.save(product);
        logStockTransaction(savedProduct.getId(), "INITIAL_SETUP", 0, savedProduct.getStock(), savedProduct.getStock(), "Initial product creation");
        return ProductResponse.from(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);
        
        Long currentUserId = SecurityUtils.currentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isAdmin = currentUser.getRole() == com.farmsetu.model.enums.UserRole.ADMIN;
        boolean isSeller = product.getSeller().getId().equals(currentUserId);
        if (!isAdmin && !isSeller) {
            throw new BadRequestException("You are not authorized to modify this product.");
        }

        Integer oldStock = product.getStock();
        Integer newStock = request.getStock() != null ? request.getStock() : (request.getQuantity() != null ? request.getQuantity() : oldStock);
        boolean stockChanged = !oldStock.equals(newStock);

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity() != null ? request.getQuantity() : newStock);
        product.setStock(newStock);
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }
        product.setUnit(request.getUnit());
        product.setCondition(request.getCondition());
        
        if (request.getImages() != null) {
            List<String> oldImages = product.getImages();
            List<String> newImages = request.getImages();
            for (String oldImg : oldImages) {
                if (!newImages.contains(oldImg)) {
                    deletePhysicalFile(oldImg);
                }
            }
            product.setImages(newImages);
        }
        
        product.setLocation(request.getLocation());
        updateStockStatus(product);
        Product saved = productRepository.save(product);

        if (stockChanged) {
            logStockTransaction(saved.getId(), "RESTOCK", oldStock, newStock, Math.abs(newStock - oldStock), "Product details updated");
        }

        return ProductResponse.from(saved);
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

        Integer oldStock = product.getStock();
        if (oldStock == null || oldStock < quantity) {
            throw new BadRequestException("Insufficient stock available for this product.");
        }

        int rows = productRepository.deductStock(productId, quantity);
        if (rows == 0) {
            throw new BadRequestException("Insufficient stock available. Someone else might have bought the item.");
        }

        product = findProduct(productId);
        Integer newStock = product.getStock();

        updateStockStatus(product);
        productRepository.save(product);

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
        logStockTransaction(productId, "DEDUCTION", oldStock, newStock, quantity, "Order placed (Order ID: " + savedOrder.getId() + ")");
        sendOrderEmailNotifications(savedOrder, buyer, product, quantity, total, deliveryAddress);

        return savedOrder;
    }

    private void sendOrderEmailNotifications(Order order, User buyer, Product product, int quantity, BigDecimal total, String deliveryAddress) {
        try {
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
        } catch (Exception e) {
            // ignore
        }
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Transactional(readOnly = true)
    public List<Order> getBuyerOrders(Long buyerId, int page, int size) {
        return orderRepository.findByBuyerIdWithRelations(buyerId, org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    @Transactional(readOnly = true)
    public List<Order> getSellerOrders(Long sellerId, int page, int size) {
        return orderRepository.findBySellerIdWithRelations(sellerId, org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    @Transactional
    public Order updateOrderStatus(Long id, DeliveryStatus status) {
        Order order = getOrder(id);
        DeliveryStatus oldStatus = order.getDeliveryStatus();
        if (oldStatus == status) {
            return order;
        }
        order.setDeliveryStatus(status);
        Order saved = orderRepository.save(order);

        boolean wasCancelledOrReturned = oldStatus == DeliveryStatus.CANCELLED || oldStatus == DeliveryStatus.RETURNED;
        boolean isCancelledOrReturned = status == DeliveryStatus.CANCELLED || status == DeliveryStatus.RETURNED;

        if (!wasCancelledOrReturned && isCancelledOrReturned) {
            restoreProductStock(order.getProduct().getId(), order.getQuantity(), 
                "Order " + (status == DeliveryStatus.CANCELLED ? "cancelled" : "returned") + " (Order ID: " + order.getId() + ")");
        } else if (wasCancelledOrReturned && !isCancelledOrReturned) {
            deductProductStock(order.getProduct().getId(), order.getQuantity(), 
                "Order re-activated (Order ID: " + order.getId() + ")");
        }

        return saved;
    }

    private void restoreProductStock(Long productId, int qty, String reason) {
        Product p = findProduct(productId);
        Integer oldStock = p.getStock();
        productRepository.restoreStock(productId, qty);
        p = findProduct(productId);
        updateStockStatus(p);
        productRepository.save(p);
        logStockTransaction(productId, "RESTORATION", oldStock, p.getStock(), qty, reason);
    }

    private void deductProductStock(Long productId, int qty, String reason) {
        Product p = findProduct(productId);
        Integer oldStock = p.getStock();
        int rows = productRepository.deductStock(productId, qty);
        if (rows == 0) {
            throw new BadRequestException("Insufficient stock available to update order status.");
        }
        p = findProduct(productId);
        updateStockStatus(p);
        productRepository.save(p);
        logStockTransaction(productId, "DEDUCTION", oldStock, p.getStock(), qty, reason);
    }

    @Transactional
    public Review addReview(Long productId, Integer rating, String text) {
        Product product = findProduct(productId);
        User reviewer = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        if (reviewRepository.findByProductIdAndReviewerId(productId, reviewer.getId()).isPresent()) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        return reviewRepository.save(Review.builder()
                .product(product)
                .reviewer(reviewer)
                .reviewedUser(product.getSeller())
                .rating(rating)
                .reviewText(text)
                .build());
    }

    @Transactional
    public Review updateReview(Long reviewId, Integer rating, String text) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        Long currentUserId = SecurityUtils.currentUserId();
        if (!review.getReviewer().getId().equals(currentUserId)) {
            throw new BadRequestException("You are not authorized to update this review.");
        }

        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        review.setRating(rating);
        review.setReviewText(text);
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        Long currentUserId = SecurityUtils.currentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        boolean isAdmin = currentUser.getRole() == com.farmsetu.model.enums.UserRole.ADMIN;
        boolean isAuthor = review.getReviewer().getId().equals(currentUserId);
        if (!isAdmin && !isAuthor) {
            throw new BadRequestException("You are not authorized to delete this review.");
        }

        reviewRepository.delete(review);
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

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        Long userId = SecurityUtils.currentUserId();
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        
        List<CartItemResponse> responses = new java.util.ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        
        for (CartItem item : items) {
            Product p = item.getProduct();
            Integer stock = p.getStock() != null ? p.getStock() : 0;
            String warning = "NONE";
            if (stock == 0) {
                warning = "OUT_OF_STOCK";
            } else if (stock < item.getQuantity()) {
                warning = "INSUFFICIENT_STOCK";
            } else if (p.getStockStatus() == com.farmsetu.model.enums.StockStatus.LOW_STOCK) {
                warning = "LOW_STOCK";
            }
            
            String image = (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0) : "";
            
            responses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(p.getId())
                    .productTitle(p.getTitle())
                    .productPrice(p.getPrice())
                    .productImage(image)
                    .requestedQuantity(item.getQuantity())
                    .availableStock(stock)
                    .stockStatus(p.getStockStatus() != null ? p.getStockStatus().name() : "IN_STOCK")
                    .warning(warning)
                    .build());
            
            if (stock > 0) {
                int qty = Math.min(item.getQuantity(), stock);
                total = total.add(p.getPrice().multiply(BigDecimal.valueOf(qty)));
            }
        }
        
        return CartResponse.builder()
                .items(responses)
                .totalAmount(total)
                .build();
    }

    @Transactional
    public CartItem addToCart(Long productId, Integer quantity) {
        Long userId = SecurityUtils.currentUserId();
        Product p = findProduct(productId);
        
        if (p.getStock() == null || p.getStock() < quantity) {
            throw new BadRequestException("Requested quantity exceeds available stock.");
        }
        
        User user = userRepository.getReferenceById(userId);
        java.util.Optional<CartItem> existingOpt = cartItemRepository.findByUserIdAndProductId(userId, productId);
        CartItem cartItem;
        if (existingOpt.isPresent()) {
            cartItem = existingOpt.get();
            int newQty = cartItem.getQuantity() + quantity;
            if (p.getStock() < newQty) {
                throw new BadRequestException("Total requested quantity (" + newQty + ") exceeds available stock.");
            }
            cartItem.setQuantity(newQty);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(p)
                    .quantity(quantity)
                    .build();
        }
        
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public CartItem updateCartQuantity(Long productId, Integer quantity) {
        Long userId = SecurityUtils.currentUserId();
        Product p = findProduct(productId);
        
        if (p.getStock() == null || p.getStock() < quantity) {
            throw new BadRequestException("Requested quantity exceeds available stock.");
        }
        
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void removeFromCart(Long productId) {
        Long userId = SecurityUtils.currentUserId();
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public List<Order> checkout(String deliveryAddress) {
        Long userId = SecurityUtils.currentUserId();
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        if (items.isEmpty()) {
            throw new BadRequestException("Cart is empty.");
        }
        
        List<Order> orders = new java.util.ArrayList<>();
        
        for (CartItem item : items) {
            Product p = item.getProduct();
            if (p.getStock() == null || p.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + p.getTitle());
            }
        }
        
        for (CartItem item : items) {
            Product p = item.getProduct();
            int quantity = item.getQuantity();
            
            int rows = productRepository.deductStock(p.getId(), quantity);
            if (rows == 0) {
                throw new BadRequestException("Insufficient stock for product: " + p.getTitle() + ". Please check your cart.");
            }
            
            p = findProduct(p.getId());
            Integer oldStock = p.getStock() + quantity;
            updateStockStatus(p);
            productRepository.save(p);
            
            BigDecimal total = p.getPrice().multiply(BigDecimal.valueOf(quantity));
            Order order = Order.builder()
                    .buyer(item.getUser())
                    .seller(p.getSeller())
                    .product(p)
                    .quantity(quantity)
                    .totalAmount(total)
                    .deliveryAddress(deliveryAddress)
                    .deliveryStatus(DeliveryStatus.PENDING)
                    .build();
            
            Order savedOrder = orderRepository.save(order);
            orders.add(savedOrder);
            
            logStockTransaction(p.getId(), "DEDUCTION", oldStock, p.getStock(), quantity, "Checkout from cart (Order ID: " + savedOrder.getId() + ")");
            sendOrderEmailNotifications(savedOrder, item.getUser(), p, quantity, total, deliveryAddress);
        }
        
        cartItemRepository.deleteByUserId(userId);
        return orders;
    }

    private void updateStockStatus(Product product) {
        if (product.getStock() == null || product.getStock() <= 0) {
            product.setStock(0);
            product.setStockStatus(com.farmsetu.model.enums.StockStatus.OUT_OF_STOCK);
        } else if (product.getStock() <= product.getLowStockThreshold()) {
            product.setStockStatus(com.farmsetu.model.enums.StockStatus.LOW_STOCK);
        } else {
            product.setStockStatus(com.farmsetu.model.enums.StockStatus.IN_STOCK);
        }
    }

    private void logStockTransaction(Long productId, String changeType, Integer prevStock, Integer newStock, Integer qty, String reason) {
        String triggeredBy = "SYSTEM";
        try {
            triggeredBy = SecurityUtils.currentUser().getEmail();
            if (triggeredBy == null || triggeredBy.isBlank()) {
                triggeredBy = "User ID: " + SecurityUtils.currentUserId();
            }
        } catch (Exception e) {
            // ignore
        }
        stockLogRepository.save(com.farmsetu.model.entity.StockLog.builder()
                .productId(productId)
                .changeType(changeType)
                .previousStock(prevStock)
                .newStock(newStock)
                .quantityChanged(qty)
                .reason(reason)
                .triggeredBy(triggeredBy)
                .build());
    }

    private void deletePhysicalFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            java.nio.file.Path path = java.nio.file.Paths.get(relativePath);
            java.io.File file = path.toFile();
            if (file.exists() && file.isFile()) {
                file.delete();
            }
        } catch (Exception e) {
            // ignore
        }
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}

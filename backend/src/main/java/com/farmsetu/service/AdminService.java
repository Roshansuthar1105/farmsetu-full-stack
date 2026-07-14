package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.util.EnumUtils;
import com.farmsetu.model.dto.crop.CropResponse;
import com.farmsetu.model.entity.*;
import com.farmsetu.model.enums.*;
import com.farmsetu.repository.*;
import lombok.RequiredArgsConstructor;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PostRepository postRepository;
    private final ProductRepository productRepository;
    private final CropRepository cropRepository;
    private final GovtSchemeRepository govtSchemeRepository;
    private final InsuranceSchemeRepository insuranceSchemeRepository;
    private final MandiRepository mandiRepository;
    private final NewsRepository newsRepository;
    private final ResourceRepository resourceRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public Map<String, Object> dashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalPosts", postRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalCrops", cropRepository.count());
        stats.put("totalSchemes", govtSchemeRepository.count());
        stats.put("totalInsurance", insuranceSchemeRepository.count());
        stats.put("totalMandis", mandiRepository.count());
        stats.put("totalNews", newsRepository.count());
        stats.put("totalResources", resourceRepository.count());

        // Active users (users with active=true)
        long activeUsers = userRepository.findAll().stream().filter(User::isActive).count();
        stats.put("activeUsers", activeUsers);

        // New users this month
        java.time.Instant startOfMonth = java.time.ZonedDateTime.now(java.time.ZoneId.systemDefault())
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).toInstant();
        long newUsersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
                .count();
        stats.put("newUsersThisMonth", newUsersThisMonth);

        // Total revenue
        java.math.BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getTotalAmount() != null)
                .map(Order::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        stats.put("totalRevenue", totalRevenue.longValue());

        return stats;
    }

    public Map<String, Object> dashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<Order> allOrders = orderRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        // Monthly Orders (last 12 months)
        List<Map<String, Object>> monthlyOrders = new ArrayList<>();
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        for (int i = 11; i >= 0; i--) {
            java.time.LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            java.time.LocalDateTime monthEnd = monthStart.plusMonths(1);
            java.time.Instant monthStartInstant = monthStart.atZone(java.time.ZoneId.systemDefault()).toInstant();
            java.time.Instant monthEndInstant = monthEnd.atZone(java.time.ZoneId.systemDefault()).toInstant();
            String monthLabel = monthNames[monthStart.getMonthValue() - 1];

            long orderCount = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(monthStartInstant) && o.getCreatedAt().isBefore(monthEndInstant))
                    .count();

            long revenue = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(monthStartInstant) && o.getCreatedAt().isBefore(monthEndInstant))
                    .filter(o -> o.getTotalAmount() != null)
                    .map(o -> o.getTotalAmount().longValue())
                    .reduce(0L, Long::sum);

            Map<String, Object> orderEntry = new HashMap<>();
            orderEntry.put("month", monthLabel);
            orderEntry.put("count", orderCount);
            monthlyOrders.add(orderEntry);

            Map<String, Object> revenueEntry = new HashMap<>();
            revenueEntry.put("month", monthLabel);
            revenueEntry.put("count", revenue);
            revenueEntry.put("revenue", revenue);
            monthlyRevenue.add(revenueEntry);
        }
        analytics.put("monthlyOrders", monthlyOrders);
        analytics.put("monthlyRevenue", monthlyRevenue);

        // User Growth (last 12 months)
        List<Map<String, Object>> userGrowth = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            java.time.LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            java.time.LocalDateTime monthEnd = monthStart.plusMonths(1);
            java.time.Instant monthStartInstant = monthStart.atZone(java.time.ZoneId.systemDefault()).toInstant();
            java.time.Instant monthEndInstant = monthEnd.atZone(java.time.ZoneId.systemDefault()).toInstant();
            String monthLabel = monthNames[monthStart.getMonthValue() - 1];

            long userCount = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(monthStartInstant) && u.getCreatedAt().isBefore(monthEndInstant))
                    .count();

            Map<String, Object> entry = new HashMap<>();
            entry.put("month", monthLabel);
            entry.put("count", userCount);
            userGrowth.add(entry);
        }
        analytics.put("userGrowth", userGrowth);

        // Orders by status
        Map<String, Long> ordersByStatus = allOrders.stream()
                .filter(o -> o.getDeliveryStatus() != null)
                .collect(Collectors.groupingBy(o -> o.getDeliveryStatus().name(), Collectors.counting()));
        analytics.put("ordersByStatus", ordersByStatus);

        // Orders by payment
        Map<String, Long> ordersByPayment = allOrders.stream()
                .filter(o -> o.getPaymentStatus() != null)
                .collect(Collectors.groupingBy(o -> o.getPaymentStatus().name(), Collectors.counting()));
        analytics.put("ordersByPayment", ordersByPayment);

        // Users by role
        Map<String, Long> usersByRole = allUsers.stream()
                .filter(u -> u.getRole() != null)
                .collect(Collectors.groupingBy(u -> u.getRole().name(), Collectors.counting()));
        analytics.put("usersByRole", usersByRole);

        return analytics;
    }

    public Map<String, Object> listUsers(int page, int size) {
        List<User> content = userRepository.findAllWithProfile(PageRequest.of(page, size));
        long totalElements = userRepository.count();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        List<Map<String, Object>> mappedContent = content.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("role", u.getRole() != null ? u.getRole().name() : "FARMER");
            map.put("profilePhoto", u.getProfilePhoto());
            map.put("bio", u.getBio());
            map.put("preferredLanguage", u.getPreferredLanguage());
            map.put("latitude", u.getLatitude());
            map.put("longitude", u.getLongitude());
            map.put("state", u.getState());
            map.put("district", u.getDistrict());
            map.put("village", u.getVillage());
            map.put("verified", u.isVerified());
            map.put("active", u.isActive());

            if (u.getFarmerProfile() != null) {
                FarmerProfile fp = u.getFarmerProfile();
                Map<String, Object> fpMap = new HashMap<>();
                fpMap.put("id", fp.getId());
                fpMap.put("farmArea", fp.getFarmArea());
                fpMap.put("soilType", fp.getSoilType());
                fpMap.put("soilPh", fp.getSoilPh());
                fpMap.put("waterSource", fp.getWaterSource());
                fpMap.put("farmingExperience", fp.getFarmingExperience());
                fpMap.put("farmingType", fp.getFarmingType() != null ? fp.getFarmingType().name() : "CONVENTIONAL");
                map.put("farmerProfile", fpMap);
            } else {
                map.put("farmerProfile", null);
            }
            return map;
        }).collect(Collectors.toList());

        return Map.of(
            "content", mappedContent,
            "page", page,
            "size", size,
            "totalElements", totalElements,
            "totalPages", totalPages,
            "last", (page + 1) * size >= totalElements
        );
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public User updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (updates.containsKey("active")) {
            user.setActive(Boolean.parseBoolean(updates.get("active").toString()));
        }
        if (updates.containsKey("role")) {
            user.setRole(EnumUtils.parseEnum(UserRole.class, updates.get("role")));
        }
        if (updates.containsKey("verified")) {
            user.setVerified(Boolean.parseBoolean(updates.get("verified").toString()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserDetails(Long id, Map<String, Object> body) {
        User user = getUser(id);
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("bio")) user.setBio((String) body.get("bio"));
        if (body.containsKey("preferredLanguage")) user.setPreferredLanguage((String) body.get("preferredLanguage"));
        if (body.containsKey("state")) user.setState((String) body.get("state"));
        if (body.containsKey("district")) user.setDistrict((String) body.get("district"));
        if (body.containsKey("village")) user.setVillage((String) body.get("village"));
        
        if (body.containsKey("latitude") && body.get("latitude") != null) {
            user.setLatitude(Double.parseDouble(body.get("latitude").toString()));
        }
        if (body.containsKey("longitude") && body.get("longitude") != null) {
            user.setLongitude(Double.parseDouble(body.get("longitude").toString()));
        }
        if (body.containsKey("active")) user.setActive(Boolean.parseBoolean(body.get("active").toString()));
        if (body.containsKey("verified")) user.setVerified(Boolean.parseBoolean(body.get("verified").toString()));
        if (body.containsKey("role")) user.setRole(EnumUtils.parseEnum(UserRole.class, body.get("role")));

        if (body.containsKey("farmArea") || body.containsKey("soilType") || body.containsKey("farmingType")) {
            FarmerProfile profile = user.getFarmerProfile();
            if (profile == null) {
                profile = new FarmerProfile();
                profile.setUser(user);
            }
            if (body.containsKey("farmArea") && body.get("farmArea") != null) {
                profile.setFarmArea(Double.parseDouble(body.get("farmArea").toString()));
            }
            if (body.containsKey("soilType")) {
                profile.setSoilType((String) body.get("soilType"));
            }
            if (body.containsKey("soilPh") && body.get("soilPh") != null) {
                profile.setSoilPh(Double.parseDouble(body.get("soilPh").toString()));
            }
            if (body.containsKey("waterSource")) {
                profile.setWaterSource((String) body.get("waterSource"));
            }
            if (body.containsKey("farmingExperience") && body.get("farmingExperience") != null) {
                profile.setFarmingExperience(Integer.parseInt(body.get("farmingExperience").toString()));
            }
            if (body.containsKey("farmingType") && body.get("farmingType") != null) {
                profile.setFarmingType(EnumUtils.parseEnum(FarmingType.class, body.get("farmingType")));
            }
            farmerProfileRepository.save(profile);
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public User verifyExpert(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(UserRole.EXPERT);
        user.setVerified(true);
        return userRepository.save(user);
    }

    public Map<String, Object> reports() {
        return Map.of("generatedAt", java.time.Instant.now());
    }

    // Products CRUD
    public Map<String, Object> listProducts(int page, int size) {
        List<Product> products = productRepository.findAllWithSeller(PageRequest.of(page, size));
        long totalElements = productRepository.count();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        List<Map<String, Object>> mappedContent = products.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("title", p.getTitle());
            map.put("description", p.getDescription());
            map.put("category", p.getCategory() != null ? p.getCategory().name() : "SEEDS");
            map.put("price", p.getPrice());
            map.put("quantity", p.getQuantity());
            map.put("unit", p.getUnit());
            map.put("condition", p.getCondition() != null ? p.getCondition().name() : "NEW");
            map.put("location", p.getLocation());
            map.put("status", p.getStatus() != null ? p.getStatus().name() : "ACTIVE");
            map.put("images", p.getImages());
            map.put("auction", p.isAuction());
            map.put("auctionEndTime", p.getAuctionEndTime() != null ? p.getAuctionEndTime().toString() : null);
            map.put("currentBid", p.getCurrentBid());
            map.put("startingBid", p.getStartingBid());
            
            if (p.getSeller() != null) {
                Map<String, Object> sellerMap = new HashMap<>();
                sellerMap.put("id", p.getSeller().getId());
                sellerMap.put("name", p.getSeller().getName());
                sellerMap.put("email", p.getSeller().getEmail());
                sellerMap.put("phone", p.getSeller().getPhone());
                sellerMap.put("role", p.getSeller().getRole() != null ? p.getSeller().getRole().name() : "SELLER");
                map.put("seller", sellerMap);
            } else {
                map.put("seller", null);
            }
            return map;
        }).collect(Collectors.toList());

        return Map.of(
            "content", mappedContent,
            "page", page,
            "size", size,
            "totalElements", totalElements,
            "totalPages", totalPages,
            "last", (page + 1) * size >= totalElements
        );
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Transactional
    public Product createProduct(Map<String, Object> body) {
        Long sellerId = Long.valueOf(body.get("sellerId").toString());
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerId));

        Product product = Product.builder()
                .seller(seller)
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .category(EnumUtils.parseEnum(ProductCategory.class, body.get("category")))
                .price(new BigDecimal(body.get("price").toString()))
                .quantity(body.containsKey("quantity") && body.get("quantity") != null ? Integer.parseInt(body.get("quantity").toString()) : 1)
                .unit((String) body.get("unit"))
                .condition(EnumUtils.parseEnum(ProductCondition.class, body.get("condition"), ProductCondition.NEW))
                .location((String) body.get("location"))
                .status(EnumUtils.parseEnum(ProductStatus.class, body.get("status"), ProductStatus.ACTIVE))
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Map<String, Object> body) {
        Product product = getProduct(id);
        if (body.containsKey("title")) product.setTitle((String) body.get("title"));
        if (body.containsKey("description")) product.setDescription((String) body.get("description"));
        if (body.containsKey("category")) product.setCategory(EnumUtils.parseEnum(ProductCategory.class, body.get("category")));
        if (body.containsKey("price")) product.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.containsKey("quantity") && body.get("quantity") != null) product.setQuantity(Integer.parseInt(body.get("quantity").toString()));
        if (body.containsKey("unit")) product.setUnit((String) body.get("unit"));
        if (body.containsKey("condition")) product.setCondition(EnumUtils.parseEnum(ProductCondition.class, body.get("condition")));
        if (body.containsKey("location")) product.setLocation((String) body.get("location"));
        if (body.containsKey("status")) product.setStatus(EnumUtils.parseEnum(ProductStatus.class, body.get("status")));
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        product.setStatus(ProductStatus.CANCELLED);
        productRepository.save(product);
    }

    // Orders CRUD
    public Map<String, Object> listOrders(int page, int size) {
        List<Order> orders = orderRepository.findAllWithRelations(PageRequest.of(page, size));
        long totalElements = orderRepository.count();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        List<Map<String, Object>> mappedContent = orders.stream().map(o -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("quantity", o.getQuantity());
            map.put("totalAmount", o.getTotalAmount());
            map.put("paymentStatus", o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "PENDING");
            map.put("paymentId", o.getPaymentId());
            map.put("deliveryStatus", o.getDeliveryStatus() != null ? o.getDeliveryStatus().name() : "PENDING");
            map.put("deliveryAddress", o.getDeliveryAddress());
            map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");

            if (o.getBuyer() != null) {
                Map<String, Object> buyerMap = new HashMap<>();
                buyerMap.put("id", o.getBuyer().getId());
                buyerMap.put("name", o.getBuyer().getName());
                map.put("buyer", buyerMap);
            } else {
                map.put("buyer", null);
            }

            if (o.getSeller() != null) {
                Map<String, Object> sellerMap = new HashMap<>();
                sellerMap.put("id", o.getSeller().getId());
                sellerMap.put("name", o.getSeller().getName());
                map.put("seller", sellerMap);
            } else {
                map.put("seller", null);
            }

            if (o.getProduct() != null) {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("id", o.getProduct().getId());
                productMap.put("title", o.getProduct().getTitle());
                map.put("product", productMap);
            } else {
                map.put("product", null);
            }

            return map;
        }).collect(Collectors.toList());

        return Map.of(
            "content", mappedContent,
            "page", page,
            "size", size,
            "totalElements", totalElements,
            "totalPages", totalPages,
            "last", (page + 1) * size >= totalElements
        );
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Transactional
    public Order updateOrder(Long id, Map<String, Object> body) {
        Order order = getOrder(id);
        if (body.containsKey("quantity") && body.get("quantity") != null) order.setQuantity(Integer.parseInt(body.get("quantity").toString()));
        if (body.containsKey("totalAmount") && body.get("totalAmount") != null) order.setTotalAmount(new BigDecimal(body.get("totalAmount").toString()));
        if (body.containsKey("paymentStatus")) order.setPaymentStatus(EnumUtils.parseEnum(PaymentStatus.class, body.get("paymentStatus")));
        if (body.containsKey("paymentId")) order.setPaymentId((String) body.get("paymentId"));
        if (body.containsKey("deliveryStatus")) order.setDeliveryStatus(EnumUtils.parseEnum(DeliveryStatus.class, body.get("deliveryStatus")));
        if (body.containsKey("deliveryAddress")) order.setDeliveryAddress((String) body.get("deliveryAddress"));
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    // Crops CRUD
    @Transactional(readOnly = true)
    public Map<String, Object> listCrops(int page, int size) {
        Page<Crop> pageResult = cropRepository.findAll(PageRequest.of(page, size));
        return Map.of(
            "content", pageResult.getContent(),
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public Crop getCrop(Long id) {
        return cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found: " + id));
    }

    @Transactional
    public Crop createCrop(Crop crop) {
        return cropRepository.save(crop);
    }

    @Transactional
    public Crop updateCrop(Long id, Crop details) {
        Crop crop = getCrop(id);
        crop.setName(details.getName());
        crop.setLocalNames(details.getLocalNames());
        crop.setSeason(details.getSeason());
        crop.setWaterRequirement(details.getWaterRequirement());
        crop.setGrowingDays(details.getGrowingDays());
        crop.setAverageYieldPerAcre(details.getAverageYieldPerAcre());
        crop.setAverageMarketPrice(details.getAverageMarketPrice());
        if (details.getSoilTypes() != null) {
            crop.getSoilTypes().clear();
            crop.getSoilTypes().addAll(details.getSoilTypes());
        }
        return cropRepository.save(crop);
    }

    @Transactional
    public void deleteCrop(Long id) {
        cropRepository.deleteById(id);
    }

    // Govt Schemes CRUD
    public Map<String, Object> listSchemes(int page, int size) {
        Page<GovtScheme> pageResult = govtSchemeRepository.findAll(PageRequest.of(page, size));
        return Map.of(
            "content", pageResult.getContent(),
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public GovtScheme getScheme(Long id) {
        return govtSchemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme not found: " + id));
    }

    @Transactional
    public GovtScheme createScheme(GovtScheme scheme) {
        return govtSchemeRepository.save(scheme);
    }

    @Transactional
    public GovtScheme updateScheme(Long id, GovtScheme details) {
        GovtScheme scheme = getScheme(id);
        scheme.setName(details.getName());
        scheme.setDescription(details.getDescription());
        scheme.setEligibilityCriteria(details.getEligibilityCriteria());
        scheme.setBenefits(details.getBenefits());
        scheme.setApplicationProcess(details.getApplicationProcess());
        scheme.setDeadline(details.getDeadline());
        scheme.setSchemeType(details.getSchemeType());
        scheme.setState(details.getState());
        scheme.setOfficialLink(details.getOfficialLink());
        scheme.setHelpline(details.getHelpline());
        return govtSchemeRepository.save(scheme);
    }

    @Transactional
    public void deleteScheme(Long id) {
        govtSchemeRepository.deleteById(id);
    }

    // Insurance CRUD
    public Map<String, Object> listInsurance(int page, int size) {
        Page<InsuranceScheme> pageResult = insuranceSchemeRepository.findAll(PageRequest.of(page, size));
        return Map.of(
            "content", pageResult.getContent(),
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public InsuranceScheme getInsurance(Long id) {
        return insuranceSchemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance scheme not found: " + id));
    }

    @Transactional
    public InsuranceScheme createInsurance(InsuranceScheme insurance) {
        return insuranceSchemeRepository.save(insurance);
    }

    @Transactional
    public InsuranceScheme updateInsurance(Long id, InsuranceScheme details) {
        InsuranceScheme insurance = getInsurance(id);
        insurance.setName(details.getName());
        insurance.setDescription(details.getDescription());
        insurance.setCoverageDetails(details.getCoverageDetails());
        insurance.setPremiumCalculationFormula(details.getPremiumCalculationFormula());
        insurance.setEligibility(details.getEligibility());
        insurance.setClaimProcess(details.getClaimProcess());
        insurance.setPartnerCompany(details.getPartnerCompany());
        insurance.setOfficialLink(details.getOfficialLink());
        return insuranceSchemeRepository.save(insurance);
    }

    @Transactional
    public void deleteInsurance(Long id) {
        insuranceSchemeRepository.deleteById(id);
    }

    // Mandi CRUD
    public Map<String, Object> listMandis(int page, int size) {
        Page<Mandi> pageResult = mandiRepository.findAll(PageRequest.of(page, size));
        return Map.of(
            "content", pageResult.getContent(),
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public Mandi getMandi(Long id) {
        return mandiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mandi not found: " + id));
    }

    @Transactional
    public Mandi createMandi(Mandi mandi) {
        return mandiRepository.save(mandi);
    }

    @Transactional
    public Mandi updateMandi(Long id, Mandi details) {
        Mandi mandi = getMandi(id);
        mandi.setName(details.getName());
        mandi.setState(details.getState());
        mandi.setDistrict(details.getDistrict());
        mandi.setLatitude(details.getLatitude());
        mandi.setLongitude(details.getLongitude());
        mandi.setAddress(details.getAddress());
        mandi.setOperatingHours(details.getOperatingHours());
        mandi.setContactPhone(details.getContactPhone());
        return mandiRepository.save(mandi);
    }

    @Transactional
    public void deleteMandi(Long id) {
        mandiRepository.deleteById(id);
    }

    // News CRUD
    public Map<String, Object> listNews(int page, int size) {
        Page<News> pageResult = newsRepository.findAll(PageRequest.of(page, size));
        return Map.of(
            "content", pageResult.getContent(),
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public News getNews(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News article not found: " + id));
    }

    @Transactional
    public News createNews(News news) {
        return newsRepository.save(news);
    }

    @Transactional
    public News updateNews(Long id, News details) {
        News news = getNews(id);
        news.setTitle(details.getTitle());
        news.setContent(details.getContent());
        news.setCategory(details.getCategory());
        news.setAuthor(details.getAuthor());
        news.setSource(details.getSource());
        news.setImageUrl(details.getImageUrl());
        news.setVerified(details.isVerified());
        news.setState(details.getState());
        news.setPublishedAt(details.getPublishedAt());
        return newsRepository.save(news);
    }

    @Transactional
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    // Resources CRUD
    public Map<String, Object> listResources(int page, int size) {
        Page<Resource> pageResult = resourceRepository.findAll(PageRequest.of(page, size));
        return Map.of(
            "content", pageResult.getContent(),
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public Resource getResource(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    @Transactional
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource updateResource(Long id, Resource details) {
        Resource resource = getResource(id);
        resource.setTitle(details.getTitle());
        resource.setDescription(details.getDescription());
        resource.setContentType(details.getContentType());
        resource.setContentUrl(details.getContentUrl());
        resource.setCropType(details.getCropType());
        resource.setTopic(details.getTopic());
        resource.setDifficultyLevel(details.getDifficultyLevel());
        resource.setLanguage(details.getLanguage());
        resource.setThumbnailUrl(details.getThumbnailUrl());
        return resourceRepository.save(resource);
    }

    @Transactional
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}



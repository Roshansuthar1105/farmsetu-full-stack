package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.dto.crop.CropResponse;
import com.farmsetu.model.entity.*;
import com.farmsetu.model.enums.*;
import com.farmsetu.repository.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

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
        return Map.of(
                "totalUsers", userRepository.count(),
                "totalOrders", orderRepository.count(),
                "totalPosts", postRepository.count()
        );
    }

    public List<Map<String, Object>> listUsers(int page, int size) { return userRepository.findAllNative(size, page * size); }

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
            user.setRole(UserRole.valueOf(updates.get("role").toString()));
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
        if (body.containsKey("role")) user.setRole(UserRole.valueOf(body.get("role").toString()));

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
                profile.setFarmingType(FarmingType.valueOf(body.get("farmingType").toString()));
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
    public List<Map<String, Object>> listProducts(int page, int size) { return productRepository.findAllNative(size, page * size); }

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
                .category(ProductCategory.valueOf((String) body.get("category")))
                .price(new BigDecimal(body.get("price").toString()))
                .quantity(body.containsKey("quantity") && body.get("quantity") != null ? Integer.parseInt(body.get("quantity").toString()) : 1)
                .unit((String) body.get("unit"))
                .condition(ProductCondition.valueOf(body.getOrDefault("condition", "NEW").toString()))
                .location((String) body.get("location"))
                .status(ProductStatus.valueOf(body.getOrDefault("status", "ACTIVE").toString()))
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Map<String, Object> body) {
        Product product = getProduct(id);
        if (body.containsKey("title")) product.setTitle((String) body.get("title"));
        if (body.containsKey("description")) product.setDescription((String) body.get("description"));
        if (body.containsKey("category")) product.setCategory(ProductCategory.valueOf((String) body.get("category")));
        if (body.containsKey("price")) product.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.containsKey("quantity") && body.get("quantity") != null) product.setQuantity(Integer.parseInt(body.get("quantity").toString()));
        if (body.containsKey("unit")) product.setUnit((String) body.get("unit"));
        if (body.containsKey("condition")) product.setCondition(ProductCondition.valueOf((String) body.get("condition")));
        if (body.containsKey("location")) product.setLocation((String) body.get("location"));
        if (body.containsKey("status")) product.setStatus(ProductStatus.valueOf((String) body.get("status")));
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        product.setStatus(ProductStatus.CANCELLED);
        productRepository.save(product);
    }

    // Orders CRUD
    public List<Map<String, Object>> listOrders(int page, int size) { return orderRepository.findAllNative(size, page * size); }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Transactional
    public Order updateOrder(Long id, Map<String, Object> body) {
        Order order = getOrder(id);
        if (body.containsKey("quantity") && body.get("quantity") != null) order.setQuantity(Integer.parseInt(body.get("quantity").toString()));
        if (body.containsKey("totalAmount") && body.get("totalAmount") != null) order.setTotalAmount(new BigDecimal(body.get("totalAmount").toString()));
        if (body.containsKey("paymentStatus")) order.setPaymentStatus(PaymentStatus.valueOf((String) body.get("paymentStatus")));
        if (body.containsKey("paymentId")) order.setPaymentId((String) body.get("paymentId"));
        if (body.containsKey("deliveryStatus")) order.setDeliveryStatus(DeliveryStatus.valueOf((String) body.get("deliveryStatus")));
        if (body.containsKey("deliveryAddress")) order.setDeliveryAddress((String) body.get("deliveryAddress"));
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    // Crops CRUD
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCrops(int page, int size) {
        return cropRepository.findAllNative(size, page * size);
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
    public List<Map<String, Object>> listSchemes(int page, int size) { return govtSchemeRepository.findAllNative(size, page * size); }

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
    public List<Map<String, Object>> listInsurance(int page, int size) { return insuranceSchemeRepository.findAllNative(size, page * size); }

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
    public List<Map<String, Object>> listMandis(int page, int size) { return mandiRepository.findAllNative(size, page * size); }

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
    public List<Map<String, Object>> listNews(int page, int size) { return newsRepository.findAllNative(size, page * size); }

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
    public List<Map<String, Object>> listResources(int page, int size) { return resourceRepository.findAllNative(size, page * size); }

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



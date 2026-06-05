package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.crop.CropResponse;
import com.farmsetu.model.entity.*;
import com.farmsetu.service.AdminService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(adminService.dashboard());
    }

    // Users
    @GetMapping("/users")
    public ApiResponse<List<Map<String, Object>>> users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listUsers(page, size));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<User> getUser(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getUser(id));
    }

    @PutMapping("/users/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(adminService.updateUser(id, body));
    }

    @PutMapping("/users/{id}/details")
    public ApiResponse<User> updateUserDetails(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(adminService.updateUserDetails(id, body));
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/reports")
    public ApiResponse<Map<String, Object>> reports() {
        return ApiResponse.ok(adminService.reports());
    }

    @PostMapping("/verify-expert/{userId}")
    public ApiResponse<User> verifyExpert(@PathVariable Long userId) {
        return ApiResponse.ok(adminService.verifyExpert(userId));
    }

    // Products
    @GetMapping("/products")
    public ApiResponse<List<Map<String, Object>>> listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listProducts(page, size));
    }

    @GetMapping("/products/{id}")
    public ApiResponse<Product> getProduct(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getProduct(id));
    }

    @PostMapping("/products")
    public ApiResponse<Product> createProduct(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(adminService.createProduct(body));
    }

    @PutMapping("/products/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(adminService.updateProduct(id, body));
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ApiResponse.ok(null);
    }

    // Orders
    @GetMapping("/orders")
    public ApiResponse<List<Map<String, Object>>> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listOrders(page, size));
    }

    @GetMapping("/orders/{id}")
    public ApiResponse<Order> getOrder(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getOrder(id));
    }

    @PutMapping("/orders/{id}")
    public ApiResponse<Order> updateOrder(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(adminService.updateOrder(id, body));
    }

    @DeleteMapping("/orders/{id}")
    public ApiResponse<Void> deleteOrder(@PathVariable Long id) {
        adminService.deleteOrder(id);
        return ApiResponse.ok(null);
    }

    // Crops
    @GetMapping("/crops")
    public ApiResponse<List<Map<String, Object>>> listCrops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listCrops(page, size));
    }

    @GetMapping("/crops/{id}")
    public ApiResponse<Crop> getCrop(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getCrop(id));
    }

    @PostMapping("/crops")
    public ApiResponse<Crop> createCrop(@RequestBody Crop crop) {
        return ApiResponse.ok(adminService.createCrop(crop));
    }

    @PutMapping("/crops/{id}")
    public ApiResponse<Crop> updateCrop(@PathVariable Long id, @RequestBody Crop crop) {
        return ApiResponse.ok(adminService.updateCrop(id, crop));
    }

    @DeleteMapping("/crops/{id}")
    public ApiResponse<Void> deleteCrop(@PathVariable Long id) {
        adminService.deleteCrop(id);
        return ApiResponse.ok(null);
    }

    // Govt Schemes
    @GetMapping("/schemes")
    public ApiResponse<List<Map<String, Object>>> listSchemes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listSchemes(page, size));
    }

    @GetMapping("/schemes/{id}")
    public ApiResponse<GovtScheme> getScheme(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getScheme(id));
    }

    @PostMapping("/schemes")
    public ApiResponse<GovtScheme> createScheme(@RequestBody GovtScheme scheme) {
        return ApiResponse.ok(adminService.createScheme(scheme));
    }

    @PutMapping("/schemes/{id}")
    public ApiResponse<GovtScheme> updateScheme(@PathVariable Long id, @RequestBody GovtScheme scheme) {
        return ApiResponse.ok(adminService.updateScheme(id, scheme));
    }

    @DeleteMapping("/schemes/{id}")
    public ApiResponse<Void> deleteScheme(@PathVariable Long id) {
        adminService.deleteScheme(id);
        return ApiResponse.ok(null);
    }

    // Insurance
    @GetMapping("/insurance")
    public ApiResponse<List<Map<String, Object>>> listInsurance(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listInsurance(page, size));
    }

    @GetMapping("/insurance/{id}")
    public ApiResponse<InsuranceScheme> getInsurance(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getInsurance(id));
    }

    @PostMapping("/insurance")
    public ApiResponse<InsuranceScheme> createInsurance(@RequestBody InsuranceScheme insurance) {
        return ApiResponse.ok(adminService.createInsurance(insurance));
    }

    @PutMapping("/insurance/{id}")
    public ApiResponse<InsuranceScheme> updateInsurance(@PathVariable Long id, @RequestBody InsuranceScheme insurance) {
        return ApiResponse.ok(adminService.updateInsurance(id, insurance));
    }

    @DeleteMapping("/insurance/{id}")
    public ApiResponse<Void> deleteInsurance(@PathVariable Long id) {
        adminService.deleteInsurance(id);
        return ApiResponse.ok(null);
    }

    // Mandis
    @GetMapping("/mandis")
    public ApiResponse<List<Map<String, Object>>> listMandis(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listMandis(page, size));
    }

    @GetMapping("/mandis/{id}")
    public ApiResponse<Mandi> getMandi(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getMandi(id));
    }

    @PostMapping("/mandis")
    public ApiResponse<Mandi> createMandi(@RequestBody Mandi mandi) {
        return ApiResponse.ok(adminService.createMandi(mandi));
    }

    @PutMapping("/mandis/{id}")
    public ApiResponse<Mandi> updateMandi(@PathVariable Long id, @RequestBody Mandi mandi) {
        return ApiResponse.ok(adminService.updateMandi(id, mandi));
    }

    @DeleteMapping("/mandis/{id}")
    public ApiResponse<Void> deleteMandi(@PathVariable Long id) {
        adminService.deleteMandi(id);
        return ApiResponse.ok(null);
    }

    // News
    @GetMapping("/news")
    public ApiResponse<List<Map<String, Object>>> listNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listNews(page, size));
    }

    @GetMapping("/news/{id}")
    public ApiResponse<News> getNews(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getNews(id));
    }

    @PostMapping("/news")
    public ApiResponse<News> createNews(@RequestBody News news) {
        return ApiResponse.ok(adminService.createNews(news));
    }

    @PutMapping("/news/{id}")
    public ApiResponse<News> updateNews(@PathVariable Long id, @RequestBody News news) {
        return ApiResponse.ok(adminService.updateNews(id, news));
    }

    @DeleteMapping("/news/{id}")
    public ApiResponse<Void> deleteNews(@PathVariable Long id) {
        adminService.deleteNews(id);
        return ApiResponse.ok(null);
    }

    // Resources
    @GetMapping("/resources")
    public ApiResponse<List<Map<String, Object>>> listResources(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listResources(page, size));
    }

    @GetMapping("/resources/{id}")
    public ApiResponse<Resource> getResource(@PathVariable Long id) {
        return ApiResponse.ok(adminService.getResource(id));
    }

    @PostMapping("/resources")
    public ApiResponse<Resource> createResource(@RequestBody Resource resource) {
        return ApiResponse.ok(adminService.createResource(resource));
    }

    @PutMapping("/resources/{id}")
    public ApiResponse<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        return ApiResponse.ok(adminService.updateResource(id, resource));
    }

    @DeleteMapping("/resources/{id}")
    public ApiResponse<Void> deleteResource(@PathVariable Long id) {
        adminService.deleteResource(id);
        return ApiResponse.ok(null);
    }
}


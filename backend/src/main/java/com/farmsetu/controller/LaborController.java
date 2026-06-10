package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.security.SecurityUtils;
import com.farmsetu.service.LaborService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/labor")
@RequiredArgsConstructor
public class LaborController {

    private final LaborService laborService;

    // ─── Jobs ───────────────────────────────────────────────────────────

    @PostMapping("/jobs")
    public ApiResponse<Map<String, Object>> createJob(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok("Job created successfully",
                laborService.createJob(SecurityUtils.currentUserId(), body));
    }

    @GetMapping("/jobs")
    public ApiResponse<List<Map<String, Object>>> listOpenJobs(
            @RequestParam(required = false) String village) {
        return ApiResponse.ok(laborService.listOpenJobs(village));
    }

    @GetMapping("/jobs/my")
    public ApiResponse<List<Map<String, Object>>> getMyJobs() {
        return ApiResponse.ok(laborService.getMyJobs(SecurityUtils.currentUserId()));
    }

    @GetMapping("/jobs/{id}")
    public ApiResponse<Map<String, Object>> getJobDetail(@PathVariable Long id) {
        return ApiResponse.ok(laborService.getJobDetail(id));
    }

    // ─── Applications ───────────────────────────────────────────────────

    @PostMapping("/jobs/{id}/apply")
    public ApiResponse<Map<String, Object>> applyForJob(@PathVariable Long id) {
        return ApiResponse.ok("Application submitted successfully",
                laborService.applyForJob(SecurityUtils.currentUserId(), id));
    }

    @GetMapping("/jobs/{id}/applications")
    public ApiResponse<List<Map<String, Object>>> getApplicationsForJob(@PathVariable Long id) {
        return ApiResponse.ok(
                laborService.getApplicationsForJob(id, SecurityUtils.currentUserId()));
    }

    @PutMapping("/applications/{id}/accept")
    public ApiResponse<Map<String, Object>> acceptApplication(@PathVariable Long id) {
        return ApiResponse.ok("Application accepted",
                laborService.acceptApplication(id, SecurityUtils.currentUserId()));
    }

    @PutMapping("/applications/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectApplication(@PathVariable Long id) {
        return ApiResponse.ok("Application rejected",
                laborService.rejectApplication(id, SecurityUtils.currentUserId()));
    }

    @GetMapping("/applications/my")
    public ApiResponse<List<Map<String, Object>>> getMyApplications() {
        return ApiResponse.ok(laborService.getMyApplications(SecurityUtils.currentUserId()));
    }
}

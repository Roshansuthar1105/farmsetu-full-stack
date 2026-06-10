package com.farmsetu.service;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.LaborApplication;
import com.farmsetu.model.entity.LaborJob;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.ApplicationStatus;
import com.farmsetu.model.enums.JobStatus;
import com.farmsetu.model.enums.NotificationType;
import com.farmsetu.repository.LaborApplicationRepository;
import com.farmsetu.repository.LaborJobRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LaborService {

    private final LaborJobRepository laborJobRepository;
    private final LaborApplicationRepository laborApplicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ─── Job CRUD ───────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> createJob(Long userId, Map<String, Object> body) {
        User farmer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String title = (String) body.get("title");
        String description = (String) body.get("description");
        Integer requiredWorkers = body.get("requiredWorkers") != null
                ? Integer.valueOf(body.get("requiredWorkers").toString()) : null;
        Double dailyWage = body.get("dailyWage") != null
                ? Double.valueOf(body.get("dailyWage").toString()) : null;
        String jobDateStr = (String) body.get("jobDate");
        String villageLocation = (String) body.get("villageLocation");

        if (title == null || title.isBlank()) {
            throw new BadRequestException("Job title is required");
        }
        if (requiredWorkers == null || requiredWorkers < 1) {
            throw new BadRequestException("Required workers must be at least 1");
        }
        if (dailyWage == null || dailyWage <= 0) {
            throw new BadRequestException("Daily wage must be a positive value");
        }
        if (jobDateStr == null || jobDateStr.isBlank()) {
            throw new BadRequestException("Job date is required");
        }

        LocalDate jobDate = LocalDate.parse(jobDateStr);
        if (jobDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Job date cannot be in the past");
        }

        // Default village from user profile if not specified
        if (villageLocation == null || villageLocation.isBlank()) {
            villageLocation = farmer.getVillage();
        }

        LaborJob job = LaborJob.builder()
                .farmer(farmer)
                .title(title)
                .description(description)
                .requiredWorkers(requiredWorkers)
                .dailyWage(dailyWage)
                .jobDate(jobDate)
                .villageLocation(villageLocation)
                .build();

        LaborJob saved = laborJobRepository.save(job);
        log.info("Labor job '{}' created by user {} for {} workers", title, userId, requiredWorkers);
        return mapJobToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listOpenJobs(String village) {
        List<LaborJob> jobs;
        if (village != null && !village.isBlank()) {
            jobs = laborJobRepository.findByVillageLocationContainingIgnoreCaseAndStatusOrderByJobDateAsc(village, JobStatus.OPEN);
        } else {
            jobs = laborJobRepository.findByStatusOrderByJobDateAsc(JobStatus.OPEN);
        }
        return jobs.stream().map(this::mapJobToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyJobs(Long userId) {
        return laborJobRepository.findByFarmerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapJobToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getJobDetail(Long jobId) {
        LaborJob job = laborJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Labor job not found"));
        Map<String, Object> response = mapJobToResponse(job);
        response.put("totalApplications", laborApplicationRepository.findByLaborJobIdOrderByAppliedAtAsc(jobId).size());
        return response;
    }

    // ─── Application Workflow ───────────────────────────────────────────

    @Transactional
    public Map<String, Object> applyForJob(Long userId, Long jobId) {
        User laborer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LaborJob job = laborJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Labor job not found"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        if (job.getFarmer().getId().equals(userId)) {
            throw new BadRequestException("You cannot apply for your own job");
        }

        if (laborApplicationRepository.existsByLaborJobIdAndLaborerId(jobId, userId)) {
            throw new BadRequestException("You have already applied for this job");
        }

        LaborApplication application = LaborApplication.builder()
                .laborJob(job)
                .laborer(laborer)
                .build();

        LaborApplication saved = laborApplicationRepository.save(application);
        log.info("User {} applied for labor job {}", userId, jobId);

        // Notify the farmer
        notificationService.create(
                job.getFarmer().getId(),
                "New Labor Application",
                laborer.getName() + " applied for your job: " + job.getTitle(),
                NotificationType.GENERAL,
                "/app/labor-booking"
        );

        return mapApplicationToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getApplicationsForJob(Long jobId, Long farmerId) {
        LaborJob job = laborJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Labor job not found"));

        if (!job.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You are not the owner of this job");
        }

        return laborApplicationRepository.findByLaborJobIdOrderByAppliedAtAsc(jobId)
                .stream()
                .map(this::mapApplicationToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Accept a labor application.
     * Core constraint: when workers_hired reaches required_workers,
     * the job status flips to FILLED and all remaining APPLIED applications are bulk-rejected.
     */
    @Transactional
    public Map<String, Object> acceptApplication(Long applicationId, Long farmerId) {
        LaborApplication application = laborApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        LaborJob job = application.getLaborJob();

        if (!job.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You are not the owner of this job");
        }

        if (application.getApplicationStatus() != ApplicationStatus.APPLIED) {
            throw new BadRequestException("This application has already been processed");
        }

        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        // Accept this application
        application.setApplicationStatus(ApplicationStatus.ACCEPTED);
        laborApplicationRepository.save(application);

        // Increment workers hired
        job.setWorkersHired(job.getWorkersHired() + 1);

        // Notify the accepted laborer
        notificationService.create(
                application.getLaborer().getId(),
                "Application Accepted! 🎉",
                "You have been hired for: " + job.getTitle() + " on " + job.getJobDate()
                        + " — Daily wage: ₹" + job.getDailyWage(),
                NotificationType.GENERAL,
                "/app/labor-booking"
        );

        // ─── Auto-close constraint ─────────────────────────────────────
        if (job.getWorkersHired().equals(job.getRequiredWorkers())) {
            job.setStatus(JobStatus.FILLED);
            log.info("Labor job {} is now FILLED ({}/{})", job.getId(), job.getWorkersHired(), job.getRequiredWorkers());

            // Bulk-reject all remaining APPLIED applications
            List<LaborApplication> pending = laborApplicationRepository
                    .findByLaborJobIdAndApplicationStatus(job.getId(), ApplicationStatus.APPLIED);

            for (LaborApplication p : pending) {
                p.setApplicationStatus(ApplicationStatus.REJECTED);
                laborApplicationRepository.save(p);

                // Notify each rejected applicant
                notificationService.create(
                        p.getLaborer().getId(),
                        "Application Update",
                        "The job \"" + job.getTitle() + "\" is now fully staffed. Your application was closed.",
                        NotificationType.GENERAL,
                        "/app/labor-booking"
                );
            }
        }

        laborJobRepository.save(job);
        return mapApplicationToResponse(application);
    }

    @Transactional
    public Map<String, Object> rejectApplication(Long applicationId, Long farmerId) {
        LaborApplication application = laborApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        LaborJob job = application.getLaborJob();

        if (!job.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You are not the owner of this job");
        }

        if (application.getApplicationStatus() != ApplicationStatus.APPLIED) {
            throw new BadRequestException("This application has already been processed");
        }

        application.setApplicationStatus(ApplicationStatus.REJECTED);
        laborApplicationRepository.save(application);

        // Notify the rejected laborer
        notificationService.create(
                application.getLaborer().getId(),
                "Application Update",
                "Your application for \"" + job.getTitle() + "\" was not selected.",
                NotificationType.GENERAL,
                "/app/labor-booking"
        );

        return mapApplicationToResponse(application);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyApplications(Long userId) {
        return laborApplicationRepository.findByLaborerIdOrderByAppliedAtDesc(userId)
                .stream()
                .map(this::mapApplicationToResponse)
                .collect(Collectors.toList());
    }

    // ─── Response Mappers ───────────────────────────────────────────────

    private Map<String, Object> mapJobToResponse(LaborJob job) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", job.getId());
        map.put("farmerId", job.getFarmer().getId());
        map.put("farmerName", job.getFarmer().getName());
        map.put("farmerVillage", job.getFarmer().getVillage());
        map.put("title", job.getTitle());
        map.put("description", job.getDescription());
        map.put("requiredWorkers", job.getRequiredWorkers());
        map.put("workersHired", job.getWorkersHired());
        map.put("dailyWage", job.getDailyWage());
        map.put("jobDate", job.getJobDate() != null ? job.getJobDate().toString() : null);
        map.put("villageLocation", job.getVillageLocation());
        map.put("status", job.getStatus().name());
        map.put("createdAt", job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
        return map;
    }

    private Map<String, Object> mapApplicationToResponse(LaborApplication app) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", app.getId());
        map.put("jobId", app.getLaborJob().getId());
        map.put("jobTitle", app.getLaborJob().getTitle());
        map.put("laborerId", app.getLaborer().getId());
        map.put("laborerName", app.getLaborer().getName());
        map.put("laborerPhone", app.getLaborer().getPhone());
        map.put("laborerVillage", app.getLaborer().getVillage());
        map.put("appliedAt", app.getAppliedAt() != null ? app.getAppliedAt().toString() : null);
        map.put("applicationStatus", app.getApplicationStatus().name());
        return map;
    }
}

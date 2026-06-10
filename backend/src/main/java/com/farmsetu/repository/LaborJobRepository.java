package com.farmsetu.repository;

import com.farmsetu.model.entity.LaborJob;
import com.farmsetu.model.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaborJobRepository extends JpaRepository<LaborJob, Long> {

    List<LaborJob> findByStatusOrderByJobDateAsc(JobStatus status);

    List<LaborJob> findByVillageLocationContainingIgnoreCaseAndStatusOrderByJobDateAsc(String village, JobStatus status);

    List<LaborJob> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}

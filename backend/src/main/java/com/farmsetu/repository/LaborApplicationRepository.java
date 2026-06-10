package com.farmsetu.repository;

import com.farmsetu.model.entity.LaborApplication;
import com.farmsetu.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaborApplicationRepository extends JpaRepository<LaborApplication, Long> {

    List<LaborApplication> findByLaborJobIdOrderByAppliedAtAsc(Long jobId);

    List<LaborApplication> findByLaborerIdOrderByAppliedAtDesc(Long laborerId);

    boolean existsByLaborJobIdAndLaborerId(Long jobId, Long laborerId);

    List<LaborApplication> findByLaborJobIdAndApplicationStatus(Long jobId, ApplicationStatus status);
}

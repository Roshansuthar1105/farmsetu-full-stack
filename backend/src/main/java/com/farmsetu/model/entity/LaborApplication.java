package com.farmsetu.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.farmsetu.model.enums.ApplicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "labor_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LaborApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private LaborJob laborJob;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laborer_id", nullable = false)
    private User laborer;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private Instant appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_status", nullable = false)
    @Builder.Default
    private ApplicationStatus applicationStatus = ApplicationStatus.APPLIED;

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (appliedAt == null) {
            appliedAt = Instant.now();
        }
    }
}

package com.farmsetu.model.entity;

import com.farmsetu.model.enums.DiseaseSeverity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "disease_detections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseDetection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(name = "crop_name")
    private String cropName;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "detected_disease")
    private String detectedDisease;

    @Enumerated(EnumType.STRING)
    private DiseaseSeverity severity;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "treatment_suggestions", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> treatmentSuggestions = new HashMap<>();
}

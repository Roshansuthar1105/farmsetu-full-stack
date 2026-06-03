package com.farmsetu.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "insurance_schemes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceScheme extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "coverage_details", columnDefinition = "TEXT")
    private String coverageDetails;

    @Column(name = "premium_calculation_formula")
    private String premiumCalculationFormula;

    @Column(columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "claim_process", columnDefinition = "TEXT")
    private String claimProcess;

    @Column(name = "partner_company")
    private String partnerCompany;

    @Column(name = "official_link")
    private String officialLink;
}

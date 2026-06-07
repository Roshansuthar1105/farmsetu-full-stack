package com.farmsetu.model.entity;

import com.farmsetu.model.enums.SchemeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "govt_schemes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GovtScheme extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "eligibility_criteria", columnDefinition = "TEXT")
    private String eligibilityCriteria;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "application_process", columnDefinition = "TEXT")
    private String applicationProcess;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "scheme_documents", joinColumns = @JoinColumn(name = "scheme_id"))
    @Column(name = "document_name")
    @Builder.Default
    private List<String> documentsRequired = new ArrayList<>();

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "scheme_type")
    private SchemeType schemeType;

    private String state;

    @Column(name = "official_link")
    private String officialLink;

    private String helpline;
}

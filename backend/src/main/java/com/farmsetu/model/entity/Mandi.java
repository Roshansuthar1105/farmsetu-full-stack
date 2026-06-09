package com.farmsetu.model.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mandis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "cropsTraded", "facilities"})
public class Mandi extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String state;
    private String district;
    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "operating_hours")
    private String operatingHours;

    @Column(name = "contact_phone")
    private String contactPhone;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "mandi_crops_traded", joinColumns = @JoinColumn(name = "mandi_id"))
    @Column(name = "crop_name")
    @Builder.Default
    private List<String> cropsTraded = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "mandi_facilities", joinColumns = @JoinColumn(name = "mandi_id"))
    @Column(name = "facility")
    @Builder.Default
    private List<String> facilities = new ArrayList<>();
}

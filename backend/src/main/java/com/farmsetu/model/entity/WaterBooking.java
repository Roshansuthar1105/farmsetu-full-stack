package com.farmsetu.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WaterBooking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "water_source_id", nullable = false)
    private WaterSource waterSource;

    @Column(name = "hours_requested", nullable = false)
    private Double hoursRequested;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED

    @Column(name = "queue_position")
    private Integer queuePosition;

    @Column(name = "scheduled_start_time")
    private LocalDateTime scheduledStartTime;

    @Column(name = "weather_warning")
    @Builder.Default
    private Boolean weatherWarning = false;

    @Column(name = "weather_rain_chance")
    private Double weatherRainChance;

    @Column(name = "preferred_time")
    private String preferredTime; // e.g. "09:30 AM"

    @Column(name = "water_supplied_liters")
    private Double waterSuppliedLiters;

    private String notes;
}

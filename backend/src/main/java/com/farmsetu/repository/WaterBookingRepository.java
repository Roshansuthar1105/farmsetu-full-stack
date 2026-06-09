package com.farmsetu.repository;

import com.farmsetu.model.entity.WaterBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaterBookingRepository extends JpaRepository<WaterBooking, Long> {
    List<WaterBooking> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<WaterBooking> findByWaterSourceIdAndBookingDateOrderByQueuePositionAsc(Long waterSourceId, LocalDate bookingDate);

    List<WaterBooking> findByWaterSourceIdAndBookingDateAndStatusOrderByQueuePositionAsc(Long waterSourceId, LocalDate bookingDate, String status);

    List<WaterBooking> findByStatusOrderByCreatedAtDesc(String status);
}

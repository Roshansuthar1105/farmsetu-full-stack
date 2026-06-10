package com.farmsetu.repository;

import com.farmsetu.model.entity.EquipmentBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Long> {

    List<EquipmentBooking> findByRenterIdOrderByCreatedAtDesc(Long renterId);

    List<EquipmentBooking> findByEquipmentOwnerIdOrderByCreatedAtDesc(Long ownerId);

    /**
     * Count bookings that overlap with a proposed time window.
     * Two intervals overlap when: start1 < end2 AND end1 > start2
     */
    @Query("SELECT COUNT(b) FROM EquipmentBooking b " +
           "WHERE b.equipment.id = :equipmentId " +
           "AND b.status IN (com.farmsetu.model.enums.BookingStatus.PENDING, com.farmsetu.model.enums.BookingStatus.APPROVED) " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    long countOverlapping(@Param("equipmentId") Long equipmentId,
                          @Param("startTime") LocalDateTime startTime,
                          @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(b) FROM EquipmentBooking b " +
           "WHERE b.equipment.id = :equipmentId " +
           "AND b.id != :bookingId " +
           "AND b.status IN (com.farmsetu.model.enums.BookingStatus.PENDING, com.farmsetu.model.enums.BookingStatus.APPROVED) " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    long countOverlappingExcludeSelf(@Param("equipmentId") Long equipmentId,
                                     @Param("bookingId") Long bookingId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);
}

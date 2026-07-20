package com.farmsetu.repository;

import com.farmsetu.model.entity.Equipment;
import com.farmsetu.model.enums.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Equipment> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    long countByOwnerId(Long ownerId);

    List<Equipment> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(EquipmentCategory category);
}

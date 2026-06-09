package com.farmsetu.repository;

import com.farmsetu.model.entity.Commodity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommodityRepository extends JpaRepository<Commodity, Long> {
    Optional<Commodity> findByNameIgnoreCase(String name);
}

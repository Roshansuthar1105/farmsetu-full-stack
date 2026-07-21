package com.farmsetu.repository;

import com.farmsetu.model.entity.Mandi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MandiRepository extends JpaRepository<Mandi, Long> {

    @Query(value = """
            SELECT * FROM mandis m
            WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(m.latitude))
            * cos(radians(m.longitude) - radians(:lng))
            + sin(radians(:lat)) * sin(radians(m.latitude)))) <= :radiusKm
            """, nativeQuery = true)
    List<Mandi> findNearby(@Param("lat") double lat,
                           @Param("lng") double lng,
                           @Param("radiusKm") double radiusKm);

    @Query(value = "SELECT * FROM mandis LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@Param("limit") int limit, @Param("offset") int offset);
    java.util.Optional<Mandi> findByNameIgnoreCase(String name);
}



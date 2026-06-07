package com.farmsetu.repository;

import com.farmsetu.model.entity.InsuranceScheme;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceSchemeRepository extends JpaRepository<InsuranceScheme, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM insurance_schemes LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



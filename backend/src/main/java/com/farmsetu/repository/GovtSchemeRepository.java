package com.farmsetu.repository;

import com.farmsetu.model.entity.GovtScheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GovtSchemeRepository extends JpaRepository<GovtScheme, Long> {
    List<GovtScheme> findByState(String state);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM govt_schemes LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



package com.farmsetu.repository;

import com.farmsetu.model.entity.GovtScheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GovtSchemeRepository extends JpaRepository<GovtScheme, Long> {
    List<GovtScheme> findByState(String state);
}

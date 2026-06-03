package com.farmsetu.repository;

import com.farmsetu.model.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {
    Page<News> findByCategory(String category, Pageable pageable);
    Page<News> findByState(String state, Pageable pageable);
}

package com.farmsetu.repository;

import com.farmsetu.model.entity.News;


import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM news WHERE category = :category LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByCategoryNative(@org.springframework.data.repository.query.Param("category") String category, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM news WHERE state = :state LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByStateNative(@org.springframework.data.repository.query.Param("state") String state, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM news LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



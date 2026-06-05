package com.farmsetu.repository;

import com.farmsetu.model.entity.Post;


import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM posts WHERE category = :category LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByCategoryNative(@org.springframework.data.repository.query.Param("category") String category, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM posts WHERE author_id = :authorId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByAuthorIdNative(@org.springframework.data.repository.query.Param("authorId") Long authorId, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM posts LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findAllNative(@org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



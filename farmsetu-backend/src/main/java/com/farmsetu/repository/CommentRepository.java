package com.farmsetu.repository;

import com.farmsetu.model.entity.Comment;


import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM comments WHERE post_id = :postId LIMIT :limit OFFSET :offset", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findByPostIdNative(@org.springframework.data.repository.query.Param("postId") Long postId, @org.springframework.data.repository.query.Param("limit") int limit, @org.springframework.data.repository.query.Param("offset") int offset);
}



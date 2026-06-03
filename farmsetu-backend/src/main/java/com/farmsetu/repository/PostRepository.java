package com.farmsetu.repository;

import com.farmsetu.model.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategory(String category, Pageable pageable);
    Page<Post> findByAuthorId(Long authorId, Pageable pageable);
}

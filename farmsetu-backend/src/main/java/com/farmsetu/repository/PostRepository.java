package com.farmsetu.repository;

import com.farmsetu.model.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCategory(String category, Pageable pageable);
    List<Post> findByAuthorId(Long authorId, Pageable pageable);
    
    @Query("SELECT p FROM Post p JOIN FETCH p.author")
    List<Post> findAllWithAuthor(Pageable pageable);
}



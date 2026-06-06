package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.News;
import com.farmsetu.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final List<Long> savedByUser = new ArrayList<>();

    public Map<String, Object> list(int page, int size) {
        org.springframework.data.domain.Page<News> pageResult = newsRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size));
        
        List<Map<String, Object>> mappedContent = pageResult.getContent().stream().map(n -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", n.getId());
            map.put("title", n.getTitle());
            map.put("content", n.getContent());
            map.put("category", n.getCategory());
            map.put("author", n.getAuthor());
            map.put("source", n.getSource());
            map.put("imageUrl", n.getImageUrl());
            map.put("verified", n.isVerified());
            map.put("state", n.getState());
            map.put("publishedAt", n.getPublishedAt() != null ? n.getPublishedAt().toString() : "");
            map.put("viewsCount", n.getViewsCount());
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return Map.of(
            "content", mappedContent,
            "page", page,
            "size", size,
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages(),
            "last", pageResult.isLast()
        );
    }

    public News getById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found"));
        news.setViewsCount(news.getViewsCount() + 1);
        return newsRepository.save(news);
    }

    @Transactional
    public News create(News news) {
        news.setPublishedAt(Instant.now());
        return newsRepository.save(news);
    }

    @Transactional
    public News update(Long id, News news) {
        News existing = getById(id);
        existing.setTitle(news.getTitle());
        existing.setContent(news.getContent());
        existing.setCategory(news.getCategory());
        existing.setTags(news.getTags());
        existing.setImageUrl(news.getImageUrl());
        existing.setState(news.getState());
        return newsRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        newsRepository.deleteById(id);
    }

    public void saveArticle(Long userId, Long newsId) {
        savedByUser.add(newsId);
    }

    public List<News> savedArticles() {
        return newsRepository.findAllById(savedByUser);
    }
}

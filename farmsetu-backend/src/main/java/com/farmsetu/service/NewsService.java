package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.dto.common.PageResponse;
import com.farmsetu.model.entity.News;
import com.farmsetu.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final List<Long> savedByUser = new ArrayList<>();

    public PageResponse<News> list(int page, int size) {
        return PageResponse.from(newsRepository.findAll(PageRequest.of(page, size)));
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

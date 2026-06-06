package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.News;
import com.farmsetu.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public ApiResponse<Map<String, Object>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(newsService.list(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<News> get(@PathVariable Long id) {
        return ApiResponse.ok(newsService.getById(id));
    }

    @PostMapping
    public ApiResponse<News> create(@RequestBody News news) {
        return ApiResponse.ok(newsService.create(news));
    }

    @PutMapping("/{id}")
    public ApiResponse<News> update(@PathVariable Long id, @RequestBody News news) {
        return ApiResponse.ok(newsService.update(id, news));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        newsService.delete(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/{id}/save")
    public ApiResponse<Void> save(@PathVariable Long id) {
        newsService.saveArticle(0L, id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/saved")
    public ApiResponse<List<News>> saved() {
        return ApiResponse.ok(newsService.savedArticles());
    }
}

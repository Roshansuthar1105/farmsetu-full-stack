package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Resource;
import com.farmsetu.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final List<Long> completedIds = new ArrayList<>();

    public Map<String, Object> list(int page, int size) {
        org.springframework.data.domain.Page<Resource> pageResult = resourceRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size));
        
        List<Map<String, Object>> mappedContent = pageResult.getContent().stream().map(r -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getTitle());
            map.put("description", r.getDescription());
            map.put("contentType", r.getContentType() != null ? r.getContentType().name() : "VIDEO");
            map.put("contentUrl", r.getContentUrl());
            map.put("cropType", r.getCropType());
            map.put("topic", r.getTopic());
            map.put("difficultyLevel", r.getDifficultyLevel() != null ? r.getDifficultyLevel().name() : "BEGINNER");
            map.put("language", r.getLanguage());
            map.put("thumbnailUrl", r.getThumbnailUrl());
            map.put("viewsCount", r.getViewsCount());
            map.put("completionCount", r.getCompletionCount());
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

    public Resource getById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        resource.setViewsCount(resource.getViewsCount() + 1);
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource create(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Transactional
    public void markProgress(Long id) {
        if (!completedIds.contains(id)) {
            completedIds.add(id);
            Resource r = getById(id);
            r.setCompletionCount(r.getCompletionCount() + 1);
            resourceRepository.save(r);
        }
    }

    public List<Resource> completed() {
        return resourceRepository.findAllById(completedIds);
    }
}

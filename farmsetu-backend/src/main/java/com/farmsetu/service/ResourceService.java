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

    public List<Map<String, Object>> list(int page, int size) {
        return resourceRepository.findAllNative(size, page * size);
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

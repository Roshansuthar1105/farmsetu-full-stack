package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.UserRole;
import com.farmsetu.repository.OrderRepository;
import com.farmsetu.repository.PostRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PostRepository postRepository;

    public Map<String, Object> dashboard() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "totalOrders", orderRepository.count(),
                "totalPosts", postRepository.count()
        );
    }

    public Page<User> listUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public User updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (updates.containsKey("active")) {
            user.setActive(Boolean.parseBoolean(updates.get("active").toString()));
        }
        if (updates.containsKey("role")) {
            user.setRole(UserRole.valueOf(updates.get("role").toString()));
        }
        if (updates.containsKey("verified")) {
            user.setVerified(Boolean.parseBoolean(updates.get("verified").toString()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public User verifyExpert(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(UserRole.EXPERT);
        user.setVerified(true);
        return userRepository.save(user);
    }

    public Map<String, Object> reports() {
        return Map.of("generatedAt", java.time.Instant.now());
    }
}

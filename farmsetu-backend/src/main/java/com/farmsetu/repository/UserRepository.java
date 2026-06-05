package com.farmsetu.repository;

import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.UserRole;
import io.lettuce.core.dynamic.annotation.Param;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmailOrPhone(String email, String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    @Query(nativeQuery = true, value = "SELECT * FROM users WHERE role = :#{#role.name()}")
    List<Map<String, Object>> findByRoleNative(@Param("role") UserRole role);

    @Query(nativeQuery = true, value = "SELECT * FROM users WHERE email = :identifier OR phone = :identifier")
    List<Map<String, Object>> findByIdentifierNative(@Param("identifier") String identifier);
    
    @Query(nativeQuery = true, value = "SELECT * FROM users LIMIT :limit OFFSET :offset")
    List<Map<String, Object>> findAllNative(@Param("limit") int limit, @Param("offset") int offset);

    default Optional<User> findByIdentifier(String identifier) {
        return findByEmailOrPhone(identifier, identifier);
    }
}


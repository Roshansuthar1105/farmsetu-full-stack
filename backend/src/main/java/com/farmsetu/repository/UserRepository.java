package com.farmsetu.repository;

import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.UserRole;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmailOrPhone(String email, String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    List<User> findByRole(UserRole role);

    List<User> findTop5ByOrderByReputationScoreDesc();

    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.phone = :identifier")
    List<User> findByIdentifierNative(@Param("identifier") String identifier);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.farmerProfile")
    List<User> findAllWithProfile(Pageable pageable);

    default Optional<User> findByIdentifier(String identifier) {
        return findByEmailOrPhone(identifier, identifier);
    }
}


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
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByIsAiTrue();

    List<User> findTop5ByOrderByReputationScoreDesc();


    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.farmerProfile")
    List<User> findAllWithProfile(Pageable pageable);

    @Query(nativeQuery = true, value = """
       select u.* from users u where lower(u.email) = :email;     
    """)
    Optional<User> getUsersByEmailId(@Param("email")String email);
    @Query("SELECT u FROM User u WHERE lower(u.email) = lower(:identifier) OR u.phone = :identifier")
    Optional<User> findByIdentifier(@Param("identifier") String identifier);
}


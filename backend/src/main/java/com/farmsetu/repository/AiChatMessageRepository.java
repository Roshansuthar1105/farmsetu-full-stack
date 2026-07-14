package com.farmsetu.repository;

import com.farmsetu.model.entity.AiChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    
    List<AiChatMessage> findByFarmerIdAndBotIdOrderByCreatedAtDesc(Long farmerId, Integer botId, Pageable pageable);
    
    void deleteByFarmerIdAndBotId(Long farmerId, Integer botId);
}

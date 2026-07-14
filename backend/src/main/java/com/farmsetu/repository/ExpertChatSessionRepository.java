package com.farmsetu.repository;

import com.farmsetu.model.entity.ExpertChatSession;
import com.farmsetu.model.enums.ChatSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExpertChatSessionRepository extends JpaRepository<ExpertChatSession, Long> {

    List<ExpertChatSession> findByFarmerIdAndStatusIn(Long farmerId, List<ChatSessionStatus> statuses);

    List<ExpertChatSession> findByStatusOrderByCreatedAtAsc(ChatSessionStatus status);

    List<ExpertChatSession> findByExpertIdAndStatus(Long expertId, ChatSessionStatus status);

    List<ExpertChatSession> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    @Query(value = "SELECT * FROM expert_chat_sessions s WHERE s.farmer_id = :farmerId AND s.status IN ('AI_ACTIVE', 'WAITING_FOR_EXPERT', 'EXPERT_ACTIVE') ORDER BY s.created_at DESC LIMIT 1", nativeQuery = true)
    Optional<ExpertChatSession> findActiveSessionByFarmerId(@Param("farmerId") Long farmerId);

    @Query(value = "SELECT COUNT(*) FROM expert_chat_sessions s WHERE s.status = 'WAITING_FOR_EXPERT' AND s.created_at < (SELECT s2.created_at FROM expert_chat_sessions s2 WHERE s2.id = :sessionId)", nativeQuery = true)
    long countAheadInQueue(@Param("sessionId") Long sessionId);
}

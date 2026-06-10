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

    @Query("SELECT s FROM ExpertChatSession s WHERE s.farmer.id = :farmerId AND s.status IN ('AI_ACTIVE', 'WAITING_FOR_EXPERT', 'EXPERT_ACTIVE') ORDER BY s.createdAt DESC")
    Optional<ExpertChatSession> findActiveSessionByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(s) FROM ExpertChatSession s WHERE s.status = 'WAITING_FOR_EXPERT' AND s.createdAt < (SELECT s2.createdAt FROM ExpertChatSession s2 WHERE s2.id = :sessionId)")
    long countAheadInQueue(@Param("sessionId") Long sessionId);
}

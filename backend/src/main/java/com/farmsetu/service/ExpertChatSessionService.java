package com.farmsetu.service;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.model.entity.ExpertChatSession;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.ChatSessionStatus;
import com.farmsetu.model.enums.UserRole;
import com.farmsetu.repository.ExpertChatSessionRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpertChatSessionService {

    private final ExpertChatSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Map<String, Object> startSession() {
        Long farmerId = SecurityUtils.currentUserId();
        log.info("Attempting to start chat session for user ID: {}", farmerId);
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> {
                    log.error("Start session failed: User not found for ID: {}", farmerId);
                    return new BadRequestException("User not found");
                });

        log.info("User found: name={}, role={}, isAi={}", farmer.getName(), farmer.getRole(), farmer.isAi());

        if (farmer.getRole() != UserRole.FARMER) {
            log.warn("Start session denied: User ID {} has role {}, only FARMER is allowed", farmerId, farmer.getRole());
            throw new BadRequestException("Only farmers can start chat sessions");
        }

        // Check for existing active session
        var existing = sessionRepository.findActiveSessionByFarmerId(farmerId);
        if (existing.isPresent()) {
            log.info("Active session already exists for farmer ID {}: session ID={}", farmerId, existing.get().getId());
            return toMap(existing.get());
        }

        log.info("Creating a new AI active chat session for farmer ID: {}", farmerId);
        ExpertChatSession session = ExpertChatSession.builder()
                .farmer(farmer)
                .status(ChatSessionStatus.AI_ACTIVE)
                .aiMessageCount(0)
                .build();

        session = sessionRepository.save(session);
        log.info("Successfully started chat session ID: {} for farmer ID: {}", session.getId(), farmerId);
        return toMap(session);
    }

    /**
     * Escalate a session from AI to the expert queue.
     */
    @Transactional
    public Map<String, Object> escalateToExpert(Long sessionId, String reason) {
        log.info("Escalating session ID {} to expert. Reason: {}", sessionId, reason);
        ExpertChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Escalation failed: Session not found for ID {}", sessionId);
                    return new BadRequestException("Session not found");
                });

        Long currentUserId = SecurityUtils.currentUserId();
        log.info("Current user ID doing escalation: {}, Farmer ID in session: {}", currentUserId, session.getFarmer().getId());
        if (!session.getFarmer().getId().equals(currentUserId)) {
            log.warn("Escalation denied: User ID {} is not authorized for session ID {}", currentUserId, sessionId);
            throw new BadRequestException("Not authorized to escalate this session");
        }

        if (session.getStatus() != ChatSessionStatus.AI_ACTIVE) {
            log.warn("Escalation denied: Session ID {} is in state {}, not AI_ACTIVE", sessionId, session.getStatus());
            throw new BadRequestException("Session is not in AI_ACTIVE state");
        }

        session.setStatus(ChatSessionStatus.WAITING_FOR_EXPERT);
        session.setEscalationReason(reason != null ? reason : "Farmer requested human expert");

        // Generate a simple AI summary if not already set
        if (session.getAiSummary() == null || session.getAiSummary().isEmpty()) {
            session.setAiSummary(generateHandoverSummary(session));
        }

        session = sessionRepository.save(session);
        log.info("Successfully escalated session ID {} to expert queue", sessionId);

        // Broadcast to expert queue topic
        broadcastQueueUpdate();

        return toMap(session);
    }

    /**
     * Expert accepts a session from the queue.
     */
    @Transactional
    public Map<String, Object> acceptSession(Long sessionId) {
        log.info("Expert attempting to accept session ID: {}", sessionId);
        ExpertChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Accept session failed: Session not found for ID {}", sessionId);
                    return new BadRequestException("Session not found");
                });

        if (session.getStatus() != ChatSessionStatus.WAITING_FOR_EXPERT) {
            log.warn("Accept session denied: Session ID {} has status {}, expected WAITING_FOR_EXPERT", sessionId, session.getStatus());
            throw new BadRequestException("Session is not waiting for an expert");
        }

        Long expertId = SecurityUtils.currentUserId();
        User expert = userRepository.findById(expertId)
                .orElseThrow(() -> new BadRequestException("Expert user not found"));

        log.info("Expert user found: name={}, role={}", expert.getName(), expert.getRole());

        if (expert.getRole() != UserRole.EXPERT && expert.getRole() != UserRole.ADMIN) {
            log.warn("Accept session denied: User ID {} has role {}, only EXPERT/ADMIN can accept", expertId, expert.getRole());
            throw new BadRequestException("Only experts can accept sessions");
        }

        session.setExpert(expert);
        session.setStatus(ChatSessionStatus.EXPERT_ACTIVE);
        session = sessionRepository.save(session);

        // Notify farmer that an expert has joined
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "EXPERT_JOINED");
        notification.put("sessionId", session.getId());
        notification.put("expertId", expertId);
        notification.put("expertName", expert.getName());
        notification.put("message", expert.getName() + " has joined your chat session");
        messagingTemplate.convertAndSend("/topic/messages/" + session.getFarmer().getId(), notification);

        // Update the expert queue for all experts
        broadcastQueueUpdate();

        return toMap(session);
    }

    /**
     * Resolve a session (by the expert).
     */
    @Transactional
    public Map<String, Object> resolveSession(Long sessionId) {
        ExpertChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Session not found"));

        if (session.getStatus() != ChatSessionStatus.EXPERT_ACTIVE) {
            throw new BadRequestException("Session is not active with an expert");
        }

        session.setStatus(ChatSessionStatus.RESOLVED);
        session.setResolvedAt(Instant.now());
        session = sessionRepository.save(session);

        // Notify farmer
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "SESSION_RESOLVED");
        notification.put("sessionId", session.getId());
        notification.put("message", "Your expert chat session has been resolved");
        messagingTemplate.convertAndSend("/topic/messages/" + session.getFarmer().getId(), notification);

        return toMap(session);
    }

    /**
     * Get the expert queue (sessions waiting for an expert).
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQueue() {
        return sessionRepository.findByStatusOrderByCreatedAtAsc(ChatSessionStatus.WAITING_FOR_EXPERT)
                .stream().map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Get session details by ID.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSessionById(Long sessionId) {
        ExpertChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Session not found"));
        return toMap(session);
    }

    /**
     * Get farmer's session history.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMySessionHistory() {
        Long farmerId = SecurityUtils.currentUserId();
        log.info("Fetching session history for farmer ID: {}", farmerId);
        List<ExpertChatSession> sessions = sessionRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        log.info("Found {} sessions in history for farmer ID {}", sessions.size(), farmerId);
        return sessions.stream().map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Get expert's active sessions.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveSessions() {
        Long expertId = SecurityUtils.currentUserId();
        return sessionRepository.findByExpertIdAndStatus(expertId, ChatSessionStatus.EXPERT_ACTIVE)
                .stream().map(this::toMap).collect(Collectors.toList());
    }

    /**
     * Increment AI message count and update summary for a session.
     */
    @Transactional
    public void recordAiInteraction(Long sessionId, String userMessage, String aiReply) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setAiMessageCount(session.getAiMessageCount() + 1);

            // Build running summary
            String existing = session.getAiSummary() != null ? session.getAiSummary() : "";
            String newEntry = "Q: " + truncate(userMessage, 100) + " | A: " + truncate(aiReply, 150);

            // Keep last 5 interactions in summary
            String[] lines = existing.split("\n");
            StringBuilder sb = new StringBuilder();
            int start = Math.max(0, lines.length - 4);
            for (int i = start; i < lines.length; i++) {
                if (!lines[i].isBlank()) {
                    sb.append(lines[i]).append("\n");
                }
            }
            sb.append(newEntry);
            session.setAiSummary(sb.toString());

            // Auto-detect topic from first message
            if (session.getTopic() == null || session.getTopic().isEmpty()) {
                session.setTopic(truncate(userMessage, 100));
            }

            sessionRepository.save(session);
        });
    }

    /**
     * Get queue position for a session.
     */
    public long getQueuePosition(Long sessionId) {
        return sessionRepository.countAheadInQueue(sessionId);
    }

    // ---- Helpers ----

    private String generateHandoverSummary(ExpertChatSession session) {
        StringBuilder sb = new StringBuilder();
        sb.append("Farmer: ").append(session.getFarmer().getName()).append("\n");
        if (session.getFarmer().getState() != null) {
            sb.append("Location: ").append(session.getFarmer().getDistrict())
                    .append(", ").append(session.getFarmer().getState()).append("\n");
        }
        sb.append("Messages exchanged with AI: ").append(session.getAiMessageCount()).append("\n");
        if (session.getTopic() != null) {
            sb.append("Topic: ").append(session.getTopic()).append("\n");
        }
        if (session.getEscalationReason() != null) {
            sb.append("Escalation reason: ").append(session.getEscalationReason()).append("\n");
        }
        if (session.getAiSummary() != null && !session.getAiSummary().isEmpty()) {
            sb.append("\n--- Conversation Summary ---\n");
            sb.append(session.getAiSummary());
        }
        return sb.toString();
    }

    private void broadcastQueueUpdate() {
        List<Map<String, Object>> queue = getQueue();
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "QUEUE_UPDATE");
        payload.put("queue", queue);
        payload.put("count", queue.size());
        messagingTemplate.convertAndSend("/topic/expert-queue", payload);
    }

    private Map<String, Object> toMap(ExpertChatSession session) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", session.getId());
        map.put("farmerId", session.getFarmer().getId());
        map.put("farmerName", session.getFarmer().getName());
        map.put("farmerPhoto", session.getFarmer().getProfilePhoto());
        map.put("farmerState", session.getFarmer().getState());
        map.put("farmerDistrict", session.getFarmer().getDistrict());
        map.put("status", session.getStatus().name());
        map.put("topic", session.getTopic());
        map.put("aiSummary", session.getAiSummary());
        map.put("aiMessageCount", session.getAiMessageCount());
        map.put("escalationReason", session.getEscalationReason());
        map.put("createdAt", session.getCreatedAt() != null ? session.getCreatedAt().toString() : "");
        map.put("resolvedAt", session.getResolvedAt() != null ? session.getResolvedAt().toString() : null);
        if (session.getExpert() != null) {
            map.put("expertId", session.getExpert().getId());
            map.put("expertName", session.getExpert().getName());
            map.put("expertPhoto", session.getExpert().getProfilePhoto());
        }
        return map;
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}

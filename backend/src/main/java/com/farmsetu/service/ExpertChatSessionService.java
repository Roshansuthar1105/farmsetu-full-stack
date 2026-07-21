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

import com.farmsetu.model.entity.AiChatMessage;
import com.farmsetu.model.entity.ChatMessage;
import com.farmsetu.model.enums.MessageType;
import com.farmsetu.repository.AiChatMessageRepository;
import com.farmsetu.repository.ChatMessageRepository;
import com.farmsetu.repository.ExpertChatSessionRepository;
import com.farmsetu.repository.UserRepository;

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
    private final ChatMessageRepository chatMessageRepository;
    private final AiChatMessageRepository aiChatMessageRepository;
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

        // Allow any authenticated user to start an AI chat session

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

        if (session.getStatus() == ChatSessionStatus.WAITING_FOR_EXPERT) {
            log.info("Session ID {} is already in WAITING_FOR_EXPERT queue. Updating summary...", sessionId);
            if (reason != null && !reason.isBlank()) {
                session.setEscalationReason(reason);
            }
            session.setAiSummary(generateHandoverSummary(session));
            session = sessionRepository.save(session);
            broadcastQueueUpdate();
            return toMap(session);
        }

        // If previous session is EXPERT_ACTIVE, RESOLVED, or CLOSED, archive it and start a NEW escalation request
        if (session.getStatus() == ChatSessionStatus.EXPERT_ACTIVE || session.getStatus() == ChatSessionStatus.RESOLVED || session.getStatus() == ChatSessionStatus.CLOSED) {
            log.info("Current active session ID {} has status {}, archiving and creating new escalation session.", session.getId(), session.getStatus());
            session.setStatus(ChatSessionStatus.RESOLVED);
            session.setResolvedAt(Instant.now());
            sessionRepository.save(session);

            // Create new session for this escalation
            session = ExpertChatSession.builder()
                    .farmer(session.getFarmer())
                    .status(ChatSessionStatus.WAITING_FOR_EXPERT)
                    .aiMessageCount(0)
                    .topic(truncate(reason, 100))
                    .escalationReason(reason != null ? reason : "Farmer requested new human agronomist review")
                    .build();
            session.setAiSummary(generateHandoverSummary(session));
            session = sessionRepository.save(session);

            log.info("Successfully created new escalation session ID {} for farmer ID {}", session.getId(), currentUserId);
            broadcastQueueUpdate();
            return toMap(session);
        }

        session.setStatus(ChatSessionStatus.WAITING_FOR_EXPERT);
        session.setEscalationReason(reason != null ? reason : "Farmer requested human expert");
        session.setAiSummary(generateHandoverSummary(session));

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

        // Auto-create initial ChatMessage from Farmer -> Expert containing the AI summary
        String summaryText = "### 📋 AI Chatbot Handoff Summary\n\n" +
                "**Farmer**: " + session.getFarmer().getName() + "\n" +
                "**Topic**: " + (session.getTopic() != null ? session.getTopic() : "General Consultation") + "\n" +
                "**Escalation Reason**: " + (session.getEscalationReason() != null ? session.getEscalationReason() : "Direct Handover Request") + "\n\n" +
                "**AI Conversation Summary**:\n" +
                (session.getAiSummary() != null && !session.getAiSummary().isBlank() ? session.getAiSummary() : "Farmer initiated chat handover from Setu AI Chatbot.");

        ChatMessage summaryMsg = ChatMessage.builder()
                .sender(session.getFarmer())
                .receiver(expert)
                .messageText(summaryText)
                .messageType(MessageType.TEXT)
                .read(false)
                .pinned(true)
                .build();
        summaryMsg = chatMessageRepository.save(summaryMsg);

        // Broadcast summary message to farmer & expert
        Map<String, Object> msgPayload = new HashMap<>();
        msgPayload.put("id", summaryMsg.getId());
        msgPayload.put("senderId", session.getFarmer().getId());
        msgPayload.put("receiverId", expertId);
        msgPayload.put("messageText", summaryText);
        msgPayload.put("messageType", "TEXT");
        msgPayload.put("read", false);
        msgPayload.put("pinned", true);
        msgPayload.put("createdAt", summaryMsg.getCreatedAt() != null ? summaryMsg.getCreatedAt().toString() : Instant.now().toString());

        messagingTemplate.convertAndSend("/topic/messages/" + session.getFarmer().getId(), msgPayload);
        messagingTemplate.convertAndSend("/topic/messages/" + expertId, msgPayload);

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
        sb.append("### 🌾 Farmer Handoff Briefing\n");
        sb.append("- **Farmer Name**: ").append(session.getFarmer().getName()).append("\n");
        if (session.getFarmer().getState() != null || session.getFarmer().getDistrict() != null) {
            sb.append("- **Location**: ")
                    .append(session.getFarmer().getDistrict() != null ? session.getFarmer().getDistrict() + ", " : "")
                    .append(session.getFarmer().getState() != null ? session.getFarmer().getState() : "").append("\n");
        }
        sb.append("- **Primary Topic**: ").append(session.getTopic() != null ? session.getTopic() : "Agricultural Consultation").append("\n");
        sb.append("- **Escalation Reason**: ").append(session.getEscalationReason() != null ? session.getEscalationReason() : "Farmer requested expert review").append("\n\n");

        // Fetch saved AI chat messages for this farmer to construct conversation transcript
        List<AiChatMessage> messages = aiChatMessageRepository.findByFarmerIdOrderByCreatedAtAsc(session.getFarmer().getId());
        if (!messages.isEmpty()) {
            sb.append("#### 📝 Summary of Recent AI Conversation:\n");
            int start = Math.max(0, messages.size() - 6);
            for (int i = start; i < messages.size(); i++) {
                AiChatMessage msg = messages.get(i);
                String sender = msg.isFromBot() ? "🤖 **Setu AI**" : "👨‍🌾 **Farmer**";
                String text = msg.getMessageText();
                if (text != null && text.length() > 300) {
                    text = text.substring(0, 297) + "...";
                }
                sb.append(sender).append(": ").append(text).append("\n\n");
            }
        } else if (session.getAiSummary() != null && !session.getAiSummary().isEmpty()) {
            sb.append("#### 📝 Summary:\n").append(session.getAiSummary());
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

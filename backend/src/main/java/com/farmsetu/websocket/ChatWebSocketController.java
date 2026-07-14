package com.farmsetu.websocket;

import com.farmsetu.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.farmsetu.service.ExpertChatSessionService expertChatSessionService;

    private static final Map<String, Long> sessionToUserMap = new ConcurrentHashMap<>();
    private static final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();

    @MessageMapping("/expert-queue.update")
    public void handleQueueUpdate() {
        log.info("Queue update requested over WebSocket");
        java.util.List<Map<String, Object>> queue = expertChatSessionService.getQueue();
        Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("type", "QUEUE_UPDATE");
        payload.put("queue", queue);
        payload.put("count", queue.size());
        messagingTemplate.convertAndSend("/topic/expert-queue", payload);
        log.info("Queue update broadcasted to experts, count={}", queue.size());
    }

    public static Set<Long> getOnlineUserIds() {
        return onlineUsers;
    }

    @MessageMapping("/chat.send")
    public void handleChatMessage(Map<String, Object> payload) {
        log.info("WebSocket chat.send received payload: {}", payload);
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            Long receiverId = Long.valueOf(payload.get("receiverId").toString());
            String text = (String) payload.get("messageText");
            com.farmsetu.model.enums.MessageType type = com.farmsetu.util.EnumUtils.parseEnum(
                    com.farmsetu.model.enums.MessageType.class, payload.get("messageType"), com.farmsetu.model.enums.MessageType.TEXT);
            String mediaUrl = (String) payload.get("mediaUrl");

            com.farmsetu.model.entity.ChatMessage msg = chatService.sendMessage(senderId, receiverId, text, type, mediaUrl);
            log.info("Message saved in DB: msgId={}, sender={}, receiver={}", msg.getId(), senderId, receiverId);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", msg.getId());
            response.put("senderId", msg.getSender().getId());
            response.put("receiverId", msg.getReceiver().getId());
            response.put("messageText", msg.getMessageText() != null ? msg.getMessageText() : "");
            response.put("messageType", msg.getMessageType().name());
            response.put("mediaUrl", msg.getMediaUrl() != null ? msg.getMediaUrl() : "");
            response.put("read", msg.isRead());
            response.put("pinned", msg.isPinned());
            response.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : "");

            log.info("Broadcasting sent message to topics: /topic/messages/{} and /topic/messages/{}", receiverId, senderId);
            messagingTemplate.convertAndSend("/topic/messages/" + receiverId, response);
            messagingTemplate.convertAndSend("/topic/messages/" + senderId, response);
        } catch (Exception e) {
            log.error("Error processing websocket chat.send: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/chat.read")
    public void handleChatRead(Map<String, Object> payload) {
        log.info("WebSocket chat.read received payload: {}", payload);
        try {
            Long messageId = Long.valueOf(payload.get("messageId").toString());
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            
            chatService.markAsRead(messageId);
            log.info("Message ID {} marked as read", messageId);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("messageId", messageId);
            response.put("read", true);

            messagingTemplate.convertAndSend("/topic/messages/" + senderId, response);
        } catch (Exception e) {
            log.error("Error processing websocket chat.read: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/chat.online")
    public void handleChatOnline(Map<String, Object> payload, @Header("simpSessionId") String sessionId) {
        log.info("WebSocket chat.online received for sessionId: {}, payload: {}", sessionId, payload);
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            sessionToUserMap.put(sessionId, userId);
            onlineUsers.add(userId);
            log.info("User ID {} added as online. Active sessionToUserMap size: {}, onlineUsers size: {}", userId, sessionToUserMap.size(), onlineUsers.size());

            Map<String, Object> statusPayload = new java.util.HashMap<>();
            statusPayload.put("userId", userId);
            statusPayload.put("status", "ONLINE");
            messagingTemplate.convertAndSend("/topic/status", statusPayload);
        } catch (Exception e) {
            log.error("Error processing websocket chat.online: {}", e.getMessage(), e);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        log.info("WebSocket session disconnect event: {}", sessionId);
        Long userId = sessionToUserMap.remove(sessionId);
        if (userId != null) {
            onlineUsers.remove(userId);
            log.info("User ID {} disconnected. Active sessionToUserMap size: {}, onlineUsers size: {}", userId, sessionToUserMap.size(), onlineUsers.size());
            Map<String, Object> statusPayload = new java.util.HashMap<>();
            statusPayload.put("userId", userId);
            statusPayload.put("status", "OFFLINE");
            messagingTemplate.convertAndSend("/topic/status", statusPayload);
        }
    }

    @MessageMapping("/auction.bid")
    @SendTo("/topic/auction")
    public Map<String, Object> broadcastBid(Map<String, Object> bid) {
        return bid;
    }
}

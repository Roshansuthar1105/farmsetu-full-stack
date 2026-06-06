package com.farmsetu.service;

import com.farmsetu.model.entity.ChatMessage;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.MessageType;
import com.farmsetu.repository.ChatMessageRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getConversation(Long otherUserId, int page, int size) {
        Long userId = SecurityUtils.currentUserId();
        List<com.farmsetu.model.entity.ChatMessage> messages = chatMessageRepository.findConversation(userId, otherUserId, org.springframework.data.domain.PageRequest.of(page, size));
        return messages.stream().map(msg -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", msg.getId());
            map.put("senderId", msg.getSender().getId());
            map.put("receiverId", msg.getReceiver().getId());
            map.put("messageText", msg.getMessageText() != null ? msg.getMessageText() : "");
            map.put("messageType", msg.getMessageType() != null ? msg.getMessageType().name() : "TEXT");
            map.put("mediaUrl", msg.getMediaUrl() != null ? msg.getMediaUrl() : "");
            map.put("read", msg.isRead());
            map.put("pinned", msg.isPinned());
            map.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public ChatMessage sendMessage(Long receiverId, String text, MessageType type, String mediaUrl) {
        return sendMessage(SecurityUtils.currentUserId(), receiverId, text, type, mediaUrl);
    }

    @Transactional
    public ChatMessage sendMessage(Long senderId, Long receiverId, String text, MessageType type, String mediaUrl) {
        User sender = userRepository.getReferenceById(senderId);
        User receiver = userRepository.getReferenceById(receiverId);

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .messageText(text)
                .messageType(type != null ? type : MessageType.TEXT)
                .mediaUrl(mediaUrl)
                .build();
        return chatMessageRepository.save(message);
    }

    @Transactional
    public void markAsRead(Long messageId) {
        chatMessageRepository.findById(messageId).ifPresent(m -> {
            m.setRead(true);
            chatMessageRepository.save(m);
        });
    }

    @Transactional
    public void markConversationAsRead(Long otherUserId) {
        Long currentUserId = SecurityUtils.currentUserId();
        List<ChatMessage> unread = chatMessageRepository.findUnreadMessages(otherUserId, currentUserId);
        for (ChatMessage m : unread) {
            m.setRead(true);
        }
        chatMessageRepository.saveAll(unread);
    }

    @Transactional
    public void togglePin(Long messageId) {
        chatMessageRepository.findById(messageId).ifPresent(m -> {
            m.setPinned(!m.isPinned());
            chatMessageRepository.save(m);
        });
    }

    public Map<String, String> aiChat(String message) {
        return Map.of(
                "reply",
                "FarmSetu AI: Connect OpenAI in your configuration. Your question was received: " + message
        );
    }
}


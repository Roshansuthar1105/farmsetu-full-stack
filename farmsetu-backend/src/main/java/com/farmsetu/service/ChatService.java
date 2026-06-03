package com.farmsetu.service;

import com.farmsetu.model.dto.common.PageResponse;
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

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public PageResponse<ChatMessage> getConversation(Long peerId, int page, int size) {
        Long userId = SecurityUtils.currentUserId();
        Page<ChatMessage> messages = chatMessageRepository.findConversation(
                userId, peerId, PageRequest.of(page, size));
        return PageResponse.from(messages);
    }

    @Transactional
    public ChatMessage sendMessage(Long receiverId, String text, MessageType type, String mediaUrl) {
        User sender = userRepository.getReferenceById(SecurityUtils.currentUserId());
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

    public Map<String, String> aiChat(String message) {
        return Map.of(
                "reply",
                "FarmSetu AI: Connect OpenAI in your configuration. Your question was received: " + message
        );
    }
}

package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.ChatMessage;
import com.farmsetu.model.enums.MessageType;
import com.farmsetu.util.EnumUtils;
import com.farmsetu.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/chats/{userId}")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> conversation(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(chatService.getConversation(userId, page, size));
    }

    @GetMapping("/chats/history/{userId}")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> history(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(chatService.getConversation(userId, page, size));
    }

    @PostMapping("/chats/send")
    public ApiResponse<ChatMessage> send(@RequestBody Map<String, Object> body) {
        Long receiverId = Long.valueOf(body.get("receiverId").toString());
        String text = (String) body.get("message");
        MessageType type = EnumUtils.parseEnum(MessageType.class, body.get("messageType"), MessageType.TEXT);
        String mediaUrl = (String) body.get("mediaUrl");
        return ApiResponse.ok(chatService.sendMessage(receiverId, text, type, mediaUrl));
    }

    @PutMapping("/chats/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id) {
        chatService.markAsRead(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/ai/chat")
    public ApiResponse<Map<String, String>> aiChat(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(chatService.aiChat(body.get("message")));
    }
}

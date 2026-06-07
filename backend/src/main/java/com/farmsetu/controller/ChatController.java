package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.ChatMessage;
import com.farmsetu.model.enums.MessageType;
import com.farmsetu.util.EnumUtils;
import com.farmsetu.service.ChatService;
import com.farmsetu.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final CloudinaryService cloudinaryService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @GetMapping("/chats/{userId:\\d+}")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> conversation(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(chatService.getConversation(userId, page, size));
    }

    @GetMapping("/chats/history/{userId:\\d+}")
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

    @PutMapping("/chats/read-all/{otherUserId}")
    public ApiResponse<Void> readAll(@PathVariable Long otherUserId) {
        chatService.markConversationAsRead(otherUserId);
        Long currentUserId = com.farmsetu.security.SecurityUtils.currentUserId();
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("senderId", currentUserId);
        response.put("readAll", true);
        messagingTemplate.convertAndSend("/topic/messages/" + otherUserId, response);
        return ApiResponse.ok(null);
    }

    @PutMapping("/chats/{id}/pin")
    public ApiResponse<Void> togglePin(@PathVariable Long id) {
        chatService.togglePin(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/chats/online")
    public ApiResponse<java.util.Set<Long>> getOnlineUsers() {
        return ApiResponse.ok(com.farmsetu.websocket.ChatWebSocketController.getOnlineUserIds());
    }

    @PostMapping("/chats/upload")
    public ApiResponse<String> uploadChatFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new com.farmsetu.exception.BadRequestException("File is empty.");
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new com.farmsetu.exception.BadRequestException("File size exceeds 10MB limit.");
            }
            String url = cloudinaryService.uploadFile(file);
            return ApiResponse.ok("", url);
        } catch (java.io.IOException e) {
            throw new com.farmsetu.exception.BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @PostMapping("/ai/chat")
    public ApiResponse<Map<String, String>> aiChat(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(chatService.aiChat(body.get("message")));
    }
}

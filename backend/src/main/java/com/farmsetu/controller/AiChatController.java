package com.farmsetu.controller;

import com.farmsetu.model.dto.ai.AiChatRequest;
import com.farmsetu.model.dto.ai.AiChatResponse;
import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    /**
     * Process query through AI Chatbot and persist in DB.
     */
    @PostMapping("/query")
    public ApiResponse<AiChatResponse> processQuery(@RequestBody AiChatRequest request) {
        return ApiResponse.ok(aiChatService.processQuery(request));
    }

    /**
     * Fetch saved AI chat history for the logged-in farmer.
     */
    @GetMapping("/history")
    public ApiResponse<List<Map<String, Object>>> getChatHistory() {
        return ApiResponse.ok(aiChatService.getChatHistory());
    }

    /**
     * Clear AI chat history for the logged-in farmer.
     */
    @DeleteMapping("/history")
    public ApiResponse<String> clearHistory() {
        aiChatService.clearHistory();
        return ApiResponse.ok("AI chat history cleared successfully", "OK");
    }

    /**
     * Escalate current AI chat session to human EXPERT role queue.
     */
    @PostMapping("/escalate")
    public ApiResponse<Map<String, Object>> escalateToExpert(
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ApiResponse.ok(aiChatService.escalateToExpert(reason));
    }
}

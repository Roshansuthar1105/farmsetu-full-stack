package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.service.ExpertChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expert-chat")
@RequiredArgsConstructor
public class ExpertChatController {

    private final ExpertChatSessionService sessionService;

    /**
     * Start a new AI chat session (or return existing active one).
     */
    @PostMapping("/sessions")
    public ApiResponse<Map<String, Object>> startSession() {
        return ApiResponse.ok(sessionService.startSession());
    }

    /**
     * Escalate a session from AI to the human expert queue.
     */
    @PutMapping("/sessions/{id}/escalate")
    public ApiResponse<Map<String, Object>> escalateSession(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ApiResponse.ok(sessionService.escalateToExpert(id, reason));
    }

    /**
     * Expert accepts a pending session from the queue.
     */
    @PutMapping("/sessions/{id}/accept")
    public ApiResponse<Map<String, Object>> acceptSession(@PathVariable Long id) {
        return ApiResponse.ok(sessionService.acceptSession(id));
    }

    /**
     * Mark a session as resolved.
     */
    @PutMapping("/sessions/{id}/resolve")
    public ApiResponse<Map<String, Object>> resolveSession(@PathVariable Long id) {
        return ApiResponse.ok(sessionService.resolveSession(id));
    }

    /**
     * Get the expert queue (all WAITING_FOR_EXPERT sessions).
     */
    @GetMapping("/queue")
    public ApiResponse<List<Map<String, Object>>> getQueue() {
        return ApiResponse.ok(sessionService.getQueue());
    }

    /**
     * Get a specific session's details and AI summary.
     */
    @GetMapping("/sessions/{id}")
    public ApiResponse<Map<String, Object>> getSession(@PathVariable Long id) {
        return ApiResponse.ok(sessionService.getSessionById(id));
    }

    /**
     * Get farmer's own session history.
     */
    @GetMapping("/my-sessions")
    public ApiResponse<List<Map<String, Object>>> getMySessionHistory() {
        return ApiResponse.ok(sessionService.getMySessionHistory());
    }

    /**
     * Get expert's currently active sessions.
     */
    @GetMapping("/active-sessions")
    public ApiResponse<List<Map<String, Object>>> getActiveSessions() {
        return ApiResponse.ok(sessionService.getActiveSessions());
    }
}

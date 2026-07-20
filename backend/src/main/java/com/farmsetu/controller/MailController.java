package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/mail")
@RequiredArgsConstructor
public class MailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ApiResponse<Map<String, String>> sendCustomMail(@RequestBody Map<String, String> body) {
        String to = body.get("to");
        String subject = body.get("subject");
        String content = body.get("content");
        
        if (to == null || to.isBlank() || subject == null || subject.isBlank() || content == null || content.isBlank()) {
            return ApiResponse.error("Missing required fields: to, subject, content");
        }

        if (content.trim().startsWith("<") && content.trim().endsWith(">")) {
            emailService.sendHtmlEmail(to, subject, content);
        } else {
            emailService.sendSimpleEmail(to, subject, content);
        }

        return ApiResponse.ok(Map.of("status", "sent", "to", to));
    }

    @PostMapping("/test")
    public ApiResponse<Map<String, Object>> sendTestMail(@RequestBody Map<String, String> body) {
        String testEmail = body.get("to");
        String subject = body.getOrDefault("subject", "Test Email");
        String content = body.getOrDefault("content", "");
        String format = body.getOrDefault("format", "html");

        if (testEmail == null || testEmail.isBlank()) {
            return ApiResponse.error("Recipient email ('to') is required for test email");
        }

        Map<String, Object> result = emailService.sendTestEmail(testEmail, subject, content, format);
        return ApiResponse.ok(result);
    }

    @PostMapping("/broadcast")
    public ApiResponse<Map<String, Object>> broadcastMail(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("subject") || !body.containsKey("content")) {
            return ApiResponse.error("Subject and content are required for broadcast");
        }

        Map<String, Object> result = emailService.broadcastEmail(body);
        return ApiResponse.ok(result);
    }

    @GetMapping("/history")
    public ApiResponse<List<Map<String, Object>>> getHistory() {
        return ApiResponse.ok(emailService.getBroadcastHistory());
    }
}

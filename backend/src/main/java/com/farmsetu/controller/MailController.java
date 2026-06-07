package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}

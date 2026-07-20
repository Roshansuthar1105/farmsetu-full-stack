package com.farmsetu.service;

import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.UserRole;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepository userRepository;

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender.email:sroshan2931@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:FarmSetu Platform}")
    private String senderName;

    private final List<Map<String, Object>> broadcastHistory = new CopyOnWriteArrayList<>();

    public void sendSimpleEmail(String to, String subject, String body) {
        sendEmail(to, subject, body, false);
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        sendEmail(to, subject, htmlContent, true);
    }

    public Map<String, Object> sendTestEmail(String testEmail, String subject, String content, String format) {
        String interpolated = interpolateVariables(content, null);
        String finalContent = formatContent(interpolated, format);
        boolean isHtml = !"text".equalsIgnoreCase(format);
        
        boolean sent = sendEmail(testEmail, "[TEST] " + subject, finalContent, isHtml);
        return Map.of(
            "status", sent ? "success" : "failed",
            "recipient", testEmail,
            "format", format,
            "processedContent", finalContent
        );
    }

    public Map<String, Object> broadcastEmail(Map<String, Object> request) {
        String targetType = (String) request.getOrDefault("targetType", "ALL"); // ALL, ROLE, USERS, CUSTOM, VERIFIED
        String roleName = (String) request.get("roleName");
        
        @SuppressWarnings("unchecked")
        List<Number> rawUserIds = (List<Number>) request.get("userIds");
        @SuppressWarnings("unchecked")
        List<String> customEmails = (List<String>) request.get("customEmails");
        
        String subject = (String) request.getOrDefault("subject", "Notification from FarmSetu");
        String content = (String) request.getOrDefault("content", "");
        String format = (String) request.getOrDefault("format", "html"); // html, markdown, text

        List<UserTarget> targets = resolveTargets(targetType, roleName, rawUserIds, customEmails);

        int totalCount = targets.size();
        int successCount = 0;
        int failureCount = 0;

        for (UserTarget target : targets) {
            try {
                String interpolated = interpolateVariables(content, target.user());
                String finalBody = formatContent(interpolated, format);
                boolean isHtml = !"text".equalsIgnoreCase(format);

                boolean sent = sendEmail(target.email(), subject, finalBody, isHtml);
                if (sent) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (Exception e) {
                log.error("Failed broadcast recipient {}: {}", target.email(), e.getMessage());
                failureCount++;
            }
        }

        Map<String, Object> historyRecord = new LinkedHashMap<>();
        historyRecord.put("id", UUID.randomUUID().toString());
        historyRecord.put("subject", subject);
        historyRecord.put("targetType", targetType);
        historyRecord.put("targetLabel", buildTargetLabel(targetType, roleName, totalCount));
        historyRecord.put("format", format);
        historyRecord.put("totalRecipients", totalCount);
        historyRecord.put("successCount", successCount);
        historyRecord.put("failureCount", failureCount);
        historyRecord.put("timestamp", Instant.now().toString());
        historyRecord.put("status", failureCount == 0 ? "SUCCESS" : (successCount > 0 ? "PARTIAL" : "FAILED"));

        broadcastHistory.add(0, historyRecord);
        if (broadcastHistory.size() > 50) {
            broadcastHistory.remove(broadcastHistory.size() - 1);
        }

        return historyRecord;
    }

    public List<Map<String, Object>> getBroadcastHistory() {
        return new ArrayList<>(broadcastHistory);
    }

    private record UserTarget(String email, User user) {}

    private List<UserTarget> resolveTargets(String targetType, String roleName, List<Number> rawUserIds, List<String> customEmails) {
        List<UserTarget> list = new ArrayList<>();

        if ("ROLE".equalsIgnoreCase(targetType) && roleName != null) {
            try {
                UserRole role = UserRole.valueOf(roleName.toUpperCase());
                List<User> users = userRepository.findByRole(role);
                for (User u : users) {
                    if (u.getEmail() != null && !u.getEmail().isBlank()) {
                        list.add(new UserTarget(u.getEmail(), u));
                    }
                }
            } catch (Exception e) {
                log.warn("Invalid role name {}", roleName);
            }
        } else if ("VERIFIED".equalsIgnoreCase(targetType)) {
            List<User> users = userRepository.findByVerifiedTrue();
            for (User u : users) {
                if (u.getEmail() != null && !u.getEmail().isBlank()) {
                    list.add(new UserTarget(u.getEmail(), u));
                }
            }
        } else if ("USERS".equalsIgnoreCase(targetType) && rawUserIds != null && !rawUserIds.isEmpty()) {
            List<Long> ids = rawUserIds.stream().map(Number::longValue).toList();
            List<User> users = userRepository.findByIdIn(ids);
            for (User u : users) {
                if (u.getEmail() != null && !u.getEmail().isBlank()) {
                    list.add(new UserTarget(u.getEmail(), u));
                }
            }
        } else if ("CUSTOM".equalsIgnoreCase(targetType) && customEmails != null && !customEmails.isEmpty()) {
            for (String email : customEmails) {
                if (email != null && !email.isBlank()) {
                    list.add(new UserTarget(email.trim(), null));
                }
            }
        } else {
            // ALL
            List<User> users = userRepository.findAll();
            for (User u : users) {
                if (u.getEmail() != null && !u.getEmail().isBlank()) {
                    list.add(new UserTarget(u.getEmail(), u));
                }
            }
        }
        return list;
    }

    private String buildTargetLabel(String targetType, String roleName, int count) {
        if ("ROLE".equalsIgnoreCase(targetType)) return "Role: " + roleName + " (" + count + ")";
        if ("VERIFIED".equalsIgnoreCase(targetType)) return "Verified Users (" + count + ")";
        if ("USERS".equalsIgnoreCase(targetType)) return "Selected Users (" + count + ")";
        if ("CUSTOM".equalsIgnoreCase(targetType)) return "Custom Emails (" + count + ")";
        return "All Users (" + count + ")";
    }

    public String interpolateVariables(String content, User user) {
        if (content == null) return "";
        String result = content;
        String name = (user != null && user.getName() != null) ? user.getName() : "Valued Member";
        String email = (user != null && user.getEmail() != null) ? user.getEmail() : "user@example.com";
        String role = (user != null && user.getRole() != null) ? user.getRole().name() : "FARMER";
        String state = (user != null && user.getState() != null) ? user.getState() : "India";
        String village = (user != null && user.getVillage() != null) ? user.getVillage() : "Local Village";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));

        result = result.replace("{{name}}", name);
        result = result.replace("{{email}}", email);
        result = result.replace("{{role}}", role);
        result = result.replace("{{state}}", state);
        result = result.replace("{{village}}", village);
        result = result.replace("{{date}}", dateStr);
        return result;
    }

    public String formatContent(String content, String format) {
        if (content == null) return "";
        if ("markdown".equalsIgnoreCase(format)) {
            return convertMarkdownToHtml(content);
        }
        if ("html".equalsIgnoreCase(format)) {
            if (!content.trim().toLowerCase().startsWith("<html")) {
                return "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;\">"
                       + content +
                       "</div>";
            }
            return content;
        }
        return content;
    }

    private String convertMarkdownToHtml(String md) {
        if (md == null) return "";
        String html = md;
        
        // Code blocks ```code```
        html = html.replaceAll("(?s)```(.*?)```", "<pre style=\"background-color:#1e293b; color:#e2e8f0; padding:12px; border-radius:8px; font-family:monospace; overflow-x:auto;\">$1</pre>");
        
        // Headings ###, ##, #
        html = html.replaceAll("(?m)^### (.*)$", "<h3 style=\"color:#059669; font-size:18px; margin-top:16px; margin-bottom:8px;\">$1</h3>");
        html = html.replaceAll("(?m)^## (.*)$", "<h2 style=\"color:#047857; font-size:22px; margin-top:20px; margin-bottom:10px;\">$1</h2>");
        html = html.replaceAll("(?m)^# (.*)$", "<h1 style=\"color:#065f46; font-size:26px; margin-top:24px; margin-bottom:12px; border-bottom:2px solid #ecfdf5; padding-bottom:6px;\">$1</h1>");
        
        // Bold **text**
        html = html.replaceAll("\\*\\*(.*?)\\*\\*", "<strong style=\"color:#111827;\">$1</strong>");
        
        // Italic *text*
        html = html.replaceAll("\\*(.*?)\\*", "<em>$1</em>");
        
        // Links [text](url)
        html = html.replaceAll("\\[([^\\]]+)\\]\\(([^\\)]+)\\)", "<a href=\"$2\" style=\"color:#10b981; font-weight:600; text-decoration:underline;\">$1</a>");
        
        // Unordered lists - item or * item
        html = html.replaceAll("(?m)^[-*] (.*)$", "<li style=\"margin-bottom:4px;\">$1</li>");
        
        // Paragraph line breaks
        html = html.replaceAll("\n\n", "</p><p style=\"margin-bottom:12px;\">");
        html = html.replaceAll("\n", "<br/>");

        return "<div style=\"font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #374151; font-size: 15px; line-height: 1.6; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);\">\n"
                + "<p style=\"margin-bottom:12px;\">" + html + "</p>\n"
                + "<hr style=\"border:none; border-top:1px solid #f3f4f6; margin-top:30px; margin-bottom:15px;\"/>\n"
                + "<footer style=\"font-size:12px; color:#9ca3af; text-align:center;\">Sent via FarmSetu Platform Email Service</footer>\n"
                + "</div>";
    }

    private boolean sendEmail(String to, String subject, String content, boolean isHtml) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Brevo API key is missing. Simulated send to {}: {}", to, subject);
            return true;
        }

        try {
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, Object> payload = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                isHtml ? "htmlContent" : "textContent", content
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, request, String.class);
            log.info("Email sent successfully via Brevo REST API to: {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to: {} via Brevo. Error: {}", to, e.getMessage());
            return false;
        }
    }
}

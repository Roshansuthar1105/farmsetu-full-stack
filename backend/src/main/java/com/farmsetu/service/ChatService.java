package com.farmsetu.service;

import com.farmsetu.model.entity.ChatMessage;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.MessageType;
import com.farmsetu.repository.ChatMessageRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.farmsetu.model.entity.AiChatMessage;
import com.farmsetu.repository.AiChatMessageRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final AiChatMessageRepository aiChatMessageRepository;

    public List<Map<String, Object>> getConversation(Long otherUserId, int page, int size) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Fetching conversation between current user ID: {} and other user ID: {} (page: {}, size: {})", userId, otherUserId, page, size);

        // If query is for an AI bot, load from ai_chats table
        Optional<User> otherUserOpt = otherUserId != null ? userRepository.findById(otherUserId) : Optional.empty();
        if (otherUserOpt.isPresent() && otherUserOpt.get().isAi()) {
            log.info("Target user ID {} is verified as an AI Bot. Fetching AI chats.", otherUserId);
            List<com.farmsetu.model.entity.AiChatMessage> messages = aiChatMessageRepository.findByFarmerIdAndBotIdOrderByCreatedAtDesc(
                userId, otherUserId.intValue(), org.springframework.data.domain.PageRequest.of(page, size)
            );
            log.info("Found {} AI chat messages.", messages.size());
            return messages.stream().map(msg -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", msg.getId());
                map.put("senderId", msg.isFromBot() ? msg.getBotId().longValue() : msg.getFarmer().getId());
                map.put("receiverId", msg.isFromBot() ? msg.getFarmer().getId() : msg.getBotId().longValue());
                map.put("messageText", msg.getMessageText() != null ? msg.getMessageText() : "");
                map.put("messageType", "TEXT");
                map.put("mediaUrl", "");
                map.put("read", true);
                map.put("pinned", false);
                map.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : "");
                return map;
            }).collect(java.util.stream.Collectors.toList());
        }

        if (otherUserOpt.isPresent()) {
            User u = otherUserOpt.get();
            log.info("Target user ID {} found: name={}, role={}, isAi={}. Fetching standard chats.", otherUserId, u.getName(), u.getRole(), u.isAi());
        } else {
            log.warn("Target user ID {} not found in database", otherUserId);
        }

        List<com.farmsetu.model.entity.ChatMessage> messages = chatMessageRepository.findConversation(userId, otherUserId, org.springframework.data.domain.PageRequest.of(page, size));
        log.info("Found {} standard chat messages in conversation.", messages.size());
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
        log.info("Marking conversation read: currentUserId={}, otherUserId={}", currentUserId, otherUserId);
        List<ChatMessage> unread = chatMessageRepository.findBySenderIdAndReceiverIdAndRead(otherUserId, currentUserId, false);
        log.info("Found {} unread messages to mark as read", unread.size());
        for (ChatMessage m : unread) {
            m.setRead(true);
        }
        chatMessageRepository.saveAll(unread);
        log.info("Successfully marked messages as read");
    }

    @Transactional
    public void togglePin(Long messageId) {
        chatMessageRepository.findById(messageId).ifPresent(m -> {
            m.setPinned(!m.isPinned());
            chatMessageRepository.save(m);
        });
    }

    private final ExpertChatSessionService expertChatSessionService;

    @org.springframework.beans.factory.annotation.Value("${ai.provider:gemini}")
    private String aiProvider;

    @org.springframework.beans.factory.annotation.Value("${gemini.api.key:}")
    private String geminiApiKey;

    @org.springframework.beans.factory.annotation.Value("${gemini.model:gemini-3.5-flash}")
    private String geminiModel;

    @org.springframework.beans.factory.annotation.Value("${gemini.base-url:https://generativelanguage.googleapis.com}")
    private String geminiBaseUrl;

    @org.springframework.beans.factory.annotation.Value("${openai.api.key:}")
    private String openaiApiKey;

    @org.springframework.beans.factory.annotation.Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @org.springframework.beans.factory.annotation.Value("${openai.base-url:https://api.openai.com}")
    private String openaiBaseUrl;

    private final org.springframework.web.client.RestTemplate restTemplate = createRestTemplate();

    private org.springframework.web.client.RestTemplate createRestTemplate() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        
        String proxyHost = System.getProperty("https.proxyHost");
        String proxyPortStr = System.getProperty("https.proxyPort");
        
        if (proxyHost == null || proxyHost.isBlank()) {
            String httpsProxy = System.getenv("HTTPS_PROXY");
            if (httpsProxy == null || httpsProxy.isBlank()) {
                httpsProxy = System.getenv("http_proxy");
            }
            if (httpsProxy == null || httpsProxy.isBlank()) {
                httpsProxy = System.getenv("https_proxy");
            }
            if (httpsProxy != null && !httpsProxy.isBlank()) {
                try {
                    java.net.URI uri = new java.net.URI(httpsProxy);
                    proxyHost = uri.getHost();
                    int port = uri.getPort();
                    proxyPortStr = String.valueOf(port == -1 ? 443 : port);
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
        
        if (proxyHost != null && !proxyHost.isBlank()) {
            int port = 443;
            if (proxyPortStr != null && !proxyPortStr.isBlank()) {
                try {
                    port = Integer.parseInt(proxyPortStr);
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
            java.net.Proxy proxy = new java.net.Proxy(java.net.Proxy.Type.HTTP, new java.net.InetSocketAddress(proxyHost, port));
            factory.setProxy(proxy);
        }
        
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(30000);
        return new org.springframework.web.client.RestTemplate(factory);
    }

    // Keywords that suggest the farmer needs a human expert
    private static final java.util.Set<String> ESCALATION_KEYWORDS = java.util.Set.of(
            "expert", "human", "person", "specialist", "doctor", "agronomist",
            "emergency", "urgent", "critical", "dying", "spreading fast",
            "disease", "infection", "pest attack", "crop failure", "wilting",
            "loan", "insurance", "subsidy", "legal", "dispute", "compensation",
            "soil test", "lab report", "chemical analysis",
            "not working", "nothing helps", "tried everything"
    );

    private String getSystemInstructionForBot(Long botId) {
        return "You are the FarmSetu AI Assistant, a helpful and certified agricultural assistant. Answer the farmer's question precisely, focusing on Indian agriculture context, crops, soil, pests, and market advice. If the query involves severe crop disease spreading, massive pest attack, legal disputes, bank loans/subsidies, or urgent crop failures, advise them to consult a human expert.";
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt, Long botId) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.contains("key-here")) {
            return null; // Fallback to local stub instantly
        }
        
        String key = geminiApiKey.trim();
        if (key.startsWith("GEMINI_API_KEY=")) {
            key = key.substring("GEMINI_API_KEY=".length()).trim();
        }

        if (key.length() < 10) {
            return null; // Fallback to local stub instantly
        }

        try {
            String baseUrl = geminiBaseUrl != null && !geminiBaseUrl.isBlank() ? geminiBaseUrl : "https://generativelanguage.googleapis.com";
            String url = baseUrl + "/v1beta/models/" + geminiModel + ":generateContent?key=" + key;

            String systemInstruction = getSystemInstructionForBot(botId);

            Map<String, Object> requestBody = new java.util.HashMap<>();
            
            java.util.List<Map<String, Object>> contents = new java.util.ArrayList<>();
            Map<String, Object> contentMap = new java.util.HashMap<>();
            contentMap.put("role", "user");
            
            java.util.List<Map<String, Object>> parts = new java.util.ArrayList<>();
            Map<String, Object> partMap = new java.util.HashMap<>();
            partMap.put("text", prompt);
            parts.add(partMap);
            contentMap.put("parts", parts);
            contents.add(contentMap);
            requestBody.put("contents", contents);

            Map<String, Object> systemInstructionMap = new java.util.HashMap<>();
            java.util.List<Map<String, Object>> sysParts = new java.util.ArrayList<>();
            Map<String, Object> sysPartMap = new java.util.HashMap<>();
            sysPartMap.put("text", systemInstruction);
            sysParts.add(sysPartMap);
            systemInstructionMap.put("parts", sysParts);
            requestBody.put("systemInstruction", systemInstructionMap);

            Map<String, Object> generationConfig = new java.util.HashMap<>();
            generationConfig.put("temperature", 0.7);
            requestBody.put("generationConfig", generationConfig);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response != null && response.containsKey("candidates")) {
                java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    if (content != null && content.containsKey("parts")) {
                        java.util.List<Map<String, Object>> respParts = (java.util.List<Map<String, Object>>) content.get("parts");
                        if (respParts != null && !respParts.isEmpty()) {
                            return (String) respParts.get(0).get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String callOpenAi(String prompt, Long botId) {
        if (openaiApiKey == null || openaiApiKey.isBlank() || openaiApiKey.contains("key-here")) {
            return null;
        }
        try {
            String baseUrl = openaiBaseUrl != null && !openaiBaseUrl.isBlank() ? openaiBaseUrl.trim() : "https://api.openai.com";
            String url = baseUrl;
            if (!url.endsWith("/v1/chat/completions") && !url.endsWith("/v1/chat/completions/")) {
                if (url.endsWith("/")) {
                    url = url + "v1/chat/completions";
                } else {
                    url = url + "/v1/chat/completions";
                }
            }

            String systemInstruction = getSystemInstructionForBot(botId);

            Map<String, Object> requestBody = new java.util.HashMap<>();
            requestBody.put("model", openaiModel != null ? openaiModel.trim() : "gpt-4o-mini");
            
            java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
            
            Map<String, Object> systemMessage = new java.util.HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemInstruction);
            messages.add(systemMessage);
            
            Map<String, Object> userMessage = new java.util.HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            messages.add(userMessage);
            
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            String key = openaiApiKey.trim();
            if (key.startsWith("OPENAI_API_KEY=")) {
                key = key.substring("OPENAI_API_KEY=".length()).trim();
            }
            headers.set("Authorization", "Bearer " + key);

            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response != null && response.containsKey("choices")) {
                java.util.List<Map<String, Object>> choices = (java.util.List<Map<String, Object>>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> msg = (Map<String, Object>) choice.get("message");
                    if (msg != null && msg.containsKey("content")) {
                        return (String) msg.get("content");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling OpenAI API: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Map<String, Object> aiChat(String message, Long sessionId, Long botId, boolean storeHistory) {
        String reply = generateAiReply(message, botId);
        boolean escalationSuggested = detectEscalation(message) || detectEscalation(reply);

        // Save conversation history to database
        if (storeHistory) {
            try {
                Long farmerId = SecurityUtils.currentUserId();
                if (farmerId != null && botId != null) {
                    saveAiChatMessage(farmerId, botId.intValue(), message, false);
                    saveAiChatMessage(farmerId, botId.intValue(), reply, true);
                }
            } catch (Exception e) {
                System.err.println("Error saving AI chat messages to database: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Record interaction in session if sessionId provided
        if (sessionId != null) {
            try {
                expertChatSessionService.recordAiInteraction(sessionId, message, reply);
            } catch (Exception e) {
                // Don't fail the chat if session recording fails
            }
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("reply", reply);
        response.put("escalationSuggested", escalationSuggested);
        return response;
    }

    public Map<String, Object> aiChat(String message, Long sessionId, Long botId) {
        return aiChat(message, sessionId, botId, true);
    }

    public Map<String, Object> aiChat(String message, Long sessionId) {
        Long botId = userRepository.findByIsAiTrue().stream().findFirst().map(User::getId)
                .orElseThrow(() -> new com.farmsetu.exception.ResourceNotFoundException("AI Assistant bot not found in database"));
        return aiChat(message, sessionId, botId, true);
    }

    // Backward-compatible overload
    public Map<String, Object> aiChat(String message) {
        Long botId = userRepository.findByIsAiTrue().stream().findFirst().map(User::getId)
                .orElseThrow(() -> new com.farmsetu.exception.ResourceNotFoundException("AI Assistant bot not found in database"));
        return aiChat(message, null, botId, true);
    }

    private String generateAiReply(String message, Long botId) {
        if (message == null || message.isBlank()) {
            return "Please describe your agricultural question so I can assist you better.";
        }

        String provider = aiProvider != null ? aiProvider.trim().toLowerCase() : "gemini";
        
        // Route request based on provider setting
        if ("openai".equals(provider)) {
            String openAiReply = callOpenAi(message, botId);
            if (openAiReply != null) return openAiReply;
            // Fallback to Gemini if OpenAI failed
            String geminiReply = callGemini(message, botId);
            if (geminiReply != null) return geminiReply;
        } else {
            String geminiReply = callGemini(message, botId);
            if (geminiReply != null) return geminiReply;
            // Fallback to OpenAI if Gemini failed
            String openAiReply = callOpenAi(message, botId);
            if (openAiReply != null) return openAiReply;
        }

        String lower = message.toLowerCase();

        // Simple keyword-based responses (stub — replace with real AI later)
        if (lower.contains("weather") || lower.contains("rain") || lower.contains("forecast")) {
            return "🌦️ For accurate weather forecasts for your area, please check the Weather section in your FarmSetu dashboard. I can help with general crop advisory based on seasonal patterns. What crop are you growing?";
        }
        if (lower.contains("price") || lower.contains("mandi") || lower.contains("rate") || lower.contains("market")) {
            return "📊 Current market prices vary by mandi and commodity. Use the Mandi Finder in your dashboard for real-time prices. Which commodity are you looking to sell?";
        }
        if (lower.contains("disease") || lower.contains("pest") || lower.contains("infection") || lower.contains("spots")) {
            return "🔬 Crop diseases require careful diagnosis. You can upload a photo of the affected plant in the Disease Detection section for AI-based identification. However, for severe or spreading infections, I recommend consulting with a certified agronomist. Would you like me to connect you with a human expert?";
        }
        if (lower.contains("fertilizer") || lower.contains("urea") || lower.contains("dap") || lower.contains("npk")) {
            return "🌱 Fertilizer recommendations depend on your soil type, crop, and growth stage. General guideline: For most Kharif crops, apply NPK 12:32:16 at sowing and top-dress with Urea at 30-35 days. Would you like specific advice for your crop?";
        }
        if (lower.contains("seed") || lower.contains("variety") || lower.contains("hybrid")) {
            return "🌾 Seed selection depends on your region, soil, and water availability. Popular high-yield varieties include HD-2967 (Wheat), Pusa Basmati 1121 (Rice), and NK-6240 (Maize). What crop and region are you planning for?";
        }
        if (lower.contains("irrigation") || lower.contains("water") || lower.contains("drip")) {
            return "💧 Water management is crucial. Drip irrigation saves 30-50% water compared to flood irrigation. For most crops, maintain 60-80% field capacity. What's your current water source and crop?";
        }
        if (lower.contains("loan") || lower.contains("credit") || lower.contains("kcc") || lower.contains("insurance")) {
            return "💰 For agricultural loans, Kisan Credit Card (KCC) offers credit at 4% interest (with timely repayment). PM Fasal Bima Yojana covers crop insurance. These are complex topics — I recommend speaking with a financial expert for personalized guidance. Shall I connect you?";
        }
        if (lower.contains("scheme") || lower.contains("government") || lower.contains("subsidy") || lower.contains("pm kisan")) {
            return "🏛️ Key government schemes: PM-KISAN (₹6000/year), PM Fasal Bima Yojana (crop insurance), Soil Health Card Scheme. Check the Govt Schemes section in your dashboard for eligibility and application details.";
        }

        return "🌾 Thank you for your question! I'm your FarmSetu AI assistant. I can help with basic queries about crops, weather, market prices, and farming techniques. Your question: \"" + message + "\" — Could you provide more details so I can give you a precise answer?";
    }

    private String generateAiReply(String message) {
        Long botId = userRepository.findByIsAiTrue().stream().findFirst().map(User::getId)
                .orElseThrow(() -> new com.farmsetu.exception.ResourceNotFoundException("AI Assistant bot not found in database"));
        return generateAiReply(message, botId);
    }

    @Transactional
    public void clearAiChatHistory(Long farmerId, Long botId) {
        if (farmerId != null && botId != null) {
            aiChatMessageRepository.deleteByFarmerIdAndBotId(farmerId, botId.intValue());
        }
    }

    private boolean detectEscalation(String message) {
        if (message == null) return false;
        String lower = message.toLowerCase();
        return ESCALATION_KEYWORDS.stream().anyMatch(lower::contains);
    }

    @Transactional
    public void saveAiChatMessage(Long farmerId, Integer botId, String text, boolean fromBot) {
        User farmer = userRepository.getReferenceById(farmerId);
        AiChatMessage msg = AiChatMessage.builder()
                .farmer(farmer)
                .botId(botId)
                .messageText(text)
                .fromBot(fromBot)
                .build();
        aiChatMessageRepository.save(msg);
    }
}

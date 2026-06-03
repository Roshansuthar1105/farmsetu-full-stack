package com.farmsetu.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ChatWebSocketController {

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public Map<String, Object> sendMessage(Map<String, Object> payload) {
        return payload;
    }

    @MessageMapping("/auction.bid")
    @SendTo("/topic/auction")
    public Map<String, Object> broadcastBid(Map<String, Object> bid) {
        return bid;
    }
}

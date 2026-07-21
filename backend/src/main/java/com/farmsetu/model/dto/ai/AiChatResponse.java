package com.farmsetu.model.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private String answer;
    private List<String> suggestions;
    private String category;
    private Long sessionId;
    private String sessionStatus;
    private List<String> sources;
}

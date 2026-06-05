package com.farmsetu.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsRequest {
    private Long id; // Used for updates
    // Add specific fields based on News as needed
}

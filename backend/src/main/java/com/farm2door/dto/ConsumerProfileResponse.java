package com.farm2door.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerProfileResponse {
    private Long id;
    private Long userId;
    private String defaultPhone;
    private String preferredLanguage;
}

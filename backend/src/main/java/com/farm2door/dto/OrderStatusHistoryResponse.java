package com.farm2door.dto;

import com.farm2door.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {
    private Long id;
    private OrderStatus status;
    private String notes;
    private String changedByName;
    private LocalDateTime createdAt;
}

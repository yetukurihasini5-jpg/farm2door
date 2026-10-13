package com.farm2door.dto;

import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.PaymentMethod;
import com.farm2door.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long consumerId;
    private String consumerName;
    private String consumerEmail;
    private String consumerPhone;
    private Long addressId;
    private String deliveryRecipientName;
    private String deliveryPhone;
    private String deliveryAddressText;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal subtotalAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private String cancellationReason;
    private String notes;
    private List<OrderItemResponse> items;
    private List<OrderStatusHistoryResponse> statusHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

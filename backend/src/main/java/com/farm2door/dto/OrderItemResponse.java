package com.farm2door.dto;

import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.ProductUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private Long farmerId;
    private String farmerName;
    private String farmName;
    private String productTitleSnapshot;
    private BigDecimal unitPriceSnapshot;
    private ProductUnit unitSnapshot;
    private BigDecimal quantity;
    private BigDecimal subtotal;
    private OrderStatus fulfillmentStatus;
    private String productImageUrl;
}

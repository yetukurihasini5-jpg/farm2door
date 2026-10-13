package com.farm2door.dto;

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
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productImageUrl;
    private ProductUnit unit;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private BigDecimal availableStock;
    private BigDecimal subtotal;
    private Long farmerId;
    private String farmName;
    private boolean isAvailable;
}

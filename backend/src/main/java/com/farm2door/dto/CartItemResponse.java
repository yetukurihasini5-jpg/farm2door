package com.farm2door.dto;

import com.farm2door.enums.ProductUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isAvailable")
    private boolean isAvailable;

    @JsonProperty("available")
    public boolean getAvailable() {
        return this.isAvailable;
    }
}

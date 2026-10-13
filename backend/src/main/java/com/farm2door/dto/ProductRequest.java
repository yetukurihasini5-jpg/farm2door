package com.farm2door.dto;

import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.ProductUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product title is required")
    private String title;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Unit is required")
    private ProductUnit unit;

    @NotNull(message = "Price per unit is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal pricePerUnit;

    @NotNull(message = "Stock quantity is required")
    @DecimalMin(value = "0.00", message = "Stock quantity cannot be negative")
    private BigDecimal stockQuantity;

    private BigDecimal minOrderQuantity;

    private String imageUrl;

    private ProductStatus status;

    private Boolean isFeatured;
}

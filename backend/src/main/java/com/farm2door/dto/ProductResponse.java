package com.farm2door.dto;

import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.ProductUnit;
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
public class ProductResponse {
    private Long id;
    private Long farmerId;
    private String farmerName;
    private String farmName;
    private String farmLocation;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String title;
    private String description;
    private ProductUnit unit;
    private BigDecimal pricePerUnit;
    private BigDecimal stockQuantity;
    private BigDecimal minOrderQuantity;
    private String imageUrl;
    private ProductStatus status;
    private Boolean isFeatured;
    private BigDecimal ratingAverage;
    private Integer reviewCount;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

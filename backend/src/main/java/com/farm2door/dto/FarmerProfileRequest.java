package com.farm2door.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerProfileRequest {
    @NotBlank(message = "Farm name is required")
    private String farmName;

    @NotBlank(message = "Farm location is required")
    private String farmLocation;

    private BigDecimal farmSizeAcres;
    private Integer experienceYears;
    private String bio;
}

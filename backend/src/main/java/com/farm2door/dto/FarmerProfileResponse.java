package com.farm2door.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerProfileResponse {
    private Long id;
    private Long userId;
    private String farmerName;
    private String farmName;
    private String farmLocation;
    private BigDecimal farmSizeAcres;
    private Integer experienceYears;
    private String bio;
    private Boolean isVerified;
}

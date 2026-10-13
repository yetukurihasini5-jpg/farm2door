package com.farm2door.dto;

import com.farm2door.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    private Role role; // Only ROLE_FARMER or ROLE_CONSUMER permitted from public API

    // Optional initial farmer details if registering as farmer
    private String farmName;
    private String farmLocation;
    private BigDecimal farmSizeAcres;
    private Integer experienceYears;
    private String bio;
}

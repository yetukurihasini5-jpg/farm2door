package com.farm2door.controller;

import com.farm2door.dto.ApiResponse;
import com.farm2door.dto.UserResponse;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for viewing and updating current user profile")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserResponse response = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update authenticated user basic profile info")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UpdateProfileDto body
    ) {
        UserResponse response = userService.updateBasicProfile(userDetails.getId(), body.getFullName(), body.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change authenticated user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ChangePasswordDto body
    ) {
        userService.changePassword(userDetails.getId(), body.getOldPassword(), body.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @Data
    public static class UpdateProfileDto {
        private String fullName;
        private String phone;
    }

    @Data
    public static class ChangePasswordDto {
        private String oldPassword;
        private String newPassword;
    }
}

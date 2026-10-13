package com.farm2door.controller;

import com.farm2door.dto.AddressRequest;
import com.farm2door.dto.AddressResponse;
import com.farm2door.dto.ApiResponse;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Delivery Addresses", description = "Consumer delivery address management")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Get all addresses for authenticated consumer")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<AddressResponse> addresses = addressService.getUserAddresses(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addresses));
    }

    @PostMapping
    @Operation(summary = "Create a new delivery address")
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse address = addressService.createAddress(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Address created successfully", address), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get address by ID")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        AddressResponse address = addressService.getAddressById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Address retrieved successfully", address));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing delivery address")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse address = addressService.updateAddress(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a delivery address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        addressService.deleteAddress(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }

    @PutMapping("/{id}/default")
    @Operation(summary = "Set address as primary default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        AddressResponse address = addressService.setDefaultAddress(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", address));
    }
}

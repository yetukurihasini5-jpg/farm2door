package com.farm2door.controller;

import com.farm2door.dto.*;
import com.farm2door.enums.OrderStatus;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.FarmerService;
import com.farm2door.service.OrderService;
import com.farm2door.service.ProductService;
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
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
@Tag(name = "Farmer Dashboard & Operations", description = "Farmer profile, product CRUD, inventory, and order fulfillment")
public class FarmerController {

    private final FarmerService farmerService;
    private final ProductService productService;
    private final OrderService orderService;

    @GetMapping("/profile")
    @Operation(summary = "Get farmer farm details")
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        FarmerProfileResponse profile = farmerService.getFarmerProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Farmer profile retrieved", profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update farmer farm details and biography")
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody FarmerProfileRequest request
    ) {
        FarmerProfileResponse profile = farmerService.updateFarmerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Farmer profile updated successfully", profile));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get farmer dashboard metrics (revenue, orders, low stock count)")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        DashboardStatsResponse stats = farmerService.getFarmerDashboardStats(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", stats));
    }

    @GetMapping("/products")
    @Operation(summary = "Get paginated products listed by current farmer")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getMyProducts(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ProductResponse> products = productService.getFarmerProducts(userDetails.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Farmer products retrieved", products));
    }

    @PostMapping("/products")
    @Operation(summary = "Create a new product listing")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse product = productService.createProduct(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", product), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing product listing")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse product = productService.updateProduct(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Deactivate product listing")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        productService.deleteProduct(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully"));
    }

    @PutMapping("/products/{id}/toggle-status")
    @Operation(summary = "Toggle product ACTIVE/INACTIVE status")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        ProductResponse product = productService.toggleProductStatus(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Product status toggled", product));
    }

    @GetMapping("/inventory/low-stock")
    @Operation(summary = "Get products below low-stock threshold")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<ProductResponse> lowStock = productService.getFarmerLowStockProducts(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Low stock products retrieved", lowStock));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get incoming orders containing farmer items")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getFarmerOrders(userDetails.getId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Advance order fulfillment status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse order = orderService.updateOrderStatus(id, userDetails.getId(), userDetails.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
    }
}

package com.farm2door.controller;

import com.farm2door.dto.*;
import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.Role;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Platform Management", description = "Administration dashboard, moderation, user control, categories, and financial reporting")
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;
    private final ProductService productService;
    private final OrderService orderService;
    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide dashboard statistics from real database")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Platform statistics retrieved", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Get paginated user accounts with optional role filter")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        PageResponse<UserResponse> users = adminService.getUsers(role, page, size);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PutMapping("/users/{id}/toggle-activation")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserActivation(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        UserResponse user = adminService.toggleUserActivation(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("User activation toggled", user));
    }

    @PutMapping("/farmers/{profileId}/toggle-verification")
    @Operation(summary = "Toggle farmer verification status")
    public ResponseEntity<ApiResponse<Void>> toggleFarmerVerification(@PathVariable Long profileId) {
        adminService.toggleFarmerVerification(profileId);
        return ResponseEntity.ok(ApiResponse.success("Farmer verification status updated"));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories for admin management")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categories));
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new product category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", category), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update an existing product category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @PutMapping("/products/{id}/status")
    @Operation(summary = "Moderate product status (ACTIVE, INACTIVE, OUT_OF_STOCK)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStatus(
            @PathVariable Long id,
            @RequestBody ProductStatusUpdateDto body
    ) {
        ProductResponse product = productService.adminSetProductStatus(id, body.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Product status updated successfully", product));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all platform orders with pagination")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getAllOrdersForAdmin(page, size);
        return ResponseEntity.ok(ApiResponse.success("All platform orders retrieved", orders));
    }

    @GetMapping("/reports/sales")
    @Operation(summary = "Generate comprehensive sales analytics report")
    public ResponseEntity<ApiResponse<SalesReportResponse>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) OrderStatus status
    ) {
        SalesReportResponse report = reportService.generateSalesReport(startDate, endDate, status);
        return ResponseEntity.ok(ApiResponse.success("Sales report generated successfully", report));
    }

    @GetMapping("/reports/export-csv")
    @Operation(summary = "Export sales report to downloadable CSV file")
    public ResponseEntity<InputStreamResource> exportOrdersCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) OrderStatus status
    ) {
        ByteArrayInputStream csvStream = reportService.exportOrdersCsv(startDate, endDate, status);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=farm2door-orders-report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(csvStream));
    }

    @Data
    public static class ProductStatusUpdateDto {
        private ProductStatus status;
    }
}

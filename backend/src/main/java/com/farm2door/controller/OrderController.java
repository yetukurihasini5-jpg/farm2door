package com.farm2door.controller;

import com.farm2door.dto.*;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders & Checkout", description = "Order processing, checkout, tracking, and state machine lifecycle")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Checkout shopping cart with Cash on Delivery and inventory deduction")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CheckoutRequest request
    ) {
        OrderResponse order = orderService.checkout(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully", order), HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get authenticated consumer order history")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getConsumerOrders(userDetails.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by order ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id
    ) {
        OrderResponse order = orderService.getOrderById(id, userDetails.getId(), userDetails.getRole());
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Track order progress and timeline history by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> trackOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String orderNumber
    ) {
        OrderResponse order = orderService.getOrderByNumber(orderNumber, userDetails.getId(), userDetails.getRole());
        return ResponseEntity.ok(ApiResponse.success("Order tracking details retrieved", order));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel eligible order and restore product inventory")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody OrderCancelRequest request
    ) {
        OrderResponse order = orderService.cancelOrder(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Advance order status according to role and state machine")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse order = orderService.updateOrderStatus(id, userDetails.getId(), userDetails.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
    }
}

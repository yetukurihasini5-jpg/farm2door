package com.farm2door.controller;

import com.farm2door.dto.ApiResponse;
import com.farm2door.dto.CartItemRequest;
import com.farm2door.dto.CartResponse;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Consumer persistent shopping cart endpoints")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current consumer shopping cart with calculated totals")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        CartResponse cart = cartService.getCart(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product item to shopping cart")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CartItemRequest request
    ) {
        CartResponse cart = cartService.addToCart(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long itemId,
            @RequestBody QuantityUpdateDto body
    ) {
        CartResponse cart = cartService.updateCartItemQuantity(userDetails.getId(), itemId, body.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long itemId
    ) {
        CartResponse cart = cartService.removeCartItem(userDetails.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from shopping cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully"));
    }

    @Data
    public static class QuantityUpdateDto {
        private BigDecimal quantity;
    }
}

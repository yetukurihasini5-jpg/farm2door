package com.farm2door.controller;

import com.farm2door.dto.ApiResponse;
import com.farm2door.dto.PageResponse;
import com.farm2door.dto.ReviewRequest;
import com.farm2door.dto.ReviewResponse;
import com.farm2door.security.UserDetailsImpl;
import com.farm2door.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews & Ratings", description = "Endpoints for customer product reviews and verified purchase feedback")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/product/{productId}")
    @Operation(summary = "Submit a verified review for a product after delivered order")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request
    ) {
        ReviewResponse review = reviewService.createReview(userDetails.getId(), productId, request);
        return new ResponseEntity<>(ApiResponse.success("Review submitted successfully", review), HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews for a product with pagination")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ReviewResponse> reviews = reviewService.getProductReviews(productId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }
}

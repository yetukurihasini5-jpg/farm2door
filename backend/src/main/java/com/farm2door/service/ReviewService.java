package com.farm2door.service;

import com.farm2door.dto.PageResponse;
import com.farm2door.dto.ReviewRequest;
import com.farm2door.dto.ReviewResponse;
import com.farm2door.entity.Order;
import com.farm2door.entity.Product;
import com.farm2door.entity.Review;
import com.farm2door.entity.User;
import com.farm2door.enums.OrderStatus;
import com.farm2door.exception.BadRequestException;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.repository.OrderRepository;
import com.farm2door.repository.ProductRepository;
import com.farm2door.repository.ReviewRepository;
import com.farm2door.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(Long consumerId, Long productId, ReviewRequest request) {
        User consumer = userRepository.findById(consumerId)
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with id: " + consumerId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        // Verification rules:
        // 1. Order must belong to this consumer
        if (!order.getConsumer().getId().equals(consumerId)) {
            throw new BadRequestException("Order does not belong to the reviewing user");
        }

        // 2. Order must be DELIVERED
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("You can only review products from delivered orders");
        }

        // 3. Product must be in this order
        boolean productInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));
        if (!productInOrder) {
            throw new BadRequestException("The product was not found in the specified order");
        }

        // 4. Check if already reviewed for this order
        if (reviewRepository.existsByConsumerIdAndProductIdAndOrderId(consumerId, productId, order.getId())) {
            throw new BadRequestException("You have already reviewed this product for this order");
        }

        Review review = Review.builder()
                .product(product)
                .consumer(consumer)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerifiedPurchase(true)
                .build();

        Review saved = reviewRepository.save(review);

        // Update product aggregated rating and review count
        long count = reviewRepository.countByProductId(productId);
        Double avgRating = reviewRepository.calculateAverageRating(productId);
        BigDecimal avg;
        if (avgRating == null) {
            avg = BigDecimal.valueOf(request.getRating()).setScale(2, RoundingMode.HALF_UP);
        } else {
            avg = BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP);
        }

        product.setRatingAverage(avg);
        product.setReviewCount((int) count);
        productRepository.save(product);

        log.info("Consumer {} reviewed product {} with rating {}", consumerId, productId, request.getRating());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage = reviewRepository.findByProductId(productId, pageable);
        return PageResponse.from(reviewPage.map(this::mapToResponse));
    }

    public ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productTitle(review.getProduct().getTitle())
                .consumerId(review.getConsumer().getId())
                .consumerName(review.getConsumer().getFullName())
                .orderId(review.getOrder().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

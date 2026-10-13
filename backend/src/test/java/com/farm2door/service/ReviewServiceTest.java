package com.farm2door.service;

import com.farm2door.dto.ReviewRequest;
import com.farm2door.dto.ReviewResponse;
import com.farm2door.entity.Order;
import com.farm2door.entity.OrderItem;
import com.farm2door.entity.Product;
import com.farm2door.entity.Review;
import com.farm2door.entity.User;
import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.Role;
import com.farm2door.exception.BadRequestException;
import com.farm2door.repository.OrderRepository;
import com.farm2door.repository.ProductRepository;
import com.farm2door.repository.ReviewRepository;
import com.farm2door.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User consumer;
    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        consumer = User.builder()
                .id(2L)
                .email("consumer@test.com")
                .fullName("Priya Consumer")
                .role(Role.ROLE_CONSUMER)
                .build();

        product = Product.builder()
                .id(100L)
                .title("Organic Tomatoes")
                .ratingAverage(BigDecimal.ZERO)
                .reviewCount(0)
                .build();

        order = Order.builder()
                .id(500L)
                .orderNumber("F2D-TEST-500")
                .consumer(consumer)
                .status(OrderStatus.DELIVERED)
                .items(new ArrayList<>())
                .build();

        OrderItem item = OrderItem.builder()
                .id(1L)
                .order(order)
                .product(product)
                .build();

        order.getItems().add(item);
    }

    @Test
    @DisplayName("Should submit verified review when order is DELIVERED and product was purchased")
    void testCreateReviewSuccess() {
        ReviewRequest request = ReviewRequest.builder()
                .orderId(500L)
                .rating(5)
                .comment("Excellent quality vegetables!")
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(consumer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByConsumerIdAndProductIdAndOrderId(2L, 100L, 500L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(88L);
            return r;
        });
        when(reviewRepository.countByProductId(100L)).thenReturn(1L);
        when(reviewRepository.calculateAverageRating(100L)).thenReturn(5.0);

        ReviewResponse response = reviewService.createReview(2L, 100L, request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertTrue(response.getIsVerifiedPurchase());
        verify(productRepository, times(1)).save(product);
        assertEquals(new BigDecimal("5.00"), product.getRatingAverage());
        assertEquals(1, product.getReviewCount());
    }

    @Test
    @DisplayName("Should reject review if order is not in DELIVERED status")
    void testCreateReviewNonDeliveredOrderFails() {
        order.setStatus(OrderStatus.PENDING);

        ReviewRequest request = ReviewRequest.builder()
                .orderId(500L)
                .rating(4)
                .comment("Too early")
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(consumer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> reviewService.createReview(2L, 100L, request));
        assertTrue(ex.getMessage().contains("delivered orders"));
        verify(reviewRepository, never()).save(any(Review.class));
    }
}

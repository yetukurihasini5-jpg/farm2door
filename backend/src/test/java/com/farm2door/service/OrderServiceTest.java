package com.farm2door.service;

import com.farm2door.dto.CheckoutRequest;
import com.farm2door.dto.OrderCancelRequest;
import com.farm2door.dto.OrderResponse;
import com.farm2door.dto.OrderStatusUpdateRequest;
import com.farm2door.entity.*;
import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.PaymentMethod;
import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.ProductUnit;
import com.farm2door.enums.Role;
import com.farm2door.exception.BadRequestException;
import com.farm2door.exception.InsufficientStockException;
import com.farm2door.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderService orderService;

    private User consumer;
    private User farmer;
    private Product product;
    private Cart cart;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        consumer = User.builder()
                .id(2L)
                .email("consumer@test.com")
                .fullName("Priya Consumer")
                .role(Role.ROLE_CONSUMER)
                .build();

        farmer = User.builder()
                .id(1L)
                .email("farmer@test.com")
                .fullName("Raju Farmer")
                .role(Role.ROLE_FARMER)
                .farmerProfile(FarmerProfile.builder().farmName("Raju Farms").farmLocation("Nashik").build())
                .build();

        product = Product.builder()
                .id(100L)
                .farmer(farmer)
                .title("Organic Tomatoes")
                .pricePerUnit(new BigDecimal("50.00"))
                .stockQuantity(new BigDecimal("20.00"))
                .minOrderQuantity(BigDecimal.ONE)
                .unit(ProductUnit.KG)
                .status(ProductStatus.ACTIVE)
                .build();

        cart = Cart.builder()
                .id(10L)
                .user(consumer)
                .items(new ArrayList<>())
                .build();

        cartItem = CartItem.builder()
                .id(101L)
                .cart(cart)
                .product(product)
                .quantity(new BigDecimal("2.00"))
                .unitPrice(new BigDecimal("50.00"))
                .build();

        cart.getItems().add(cartItem);
    }

    @Test
    @DisplayName("Should successfully place order, deduct stock, and clear cart")
    void testCheckoutSuccess() {
        CheckoutRequest request = CheckoutRequest.builder()
                .recipientName("Priya")
                .phoneNumber("9876543210")
                .streetAddress("123 MG Road")
                .city("Pune")
                .state("Maharashtra")
                .postalCode("411001")
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(consumer));
        when(cartRepository.findByUserId(2L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(500L);
            return o;
        });

        OrderResponse response = orderService.checkout(2L, request);

        assertNotNull(response);
        // Stock should be deducted: 20 - 2 = 18
        assertEquals(new BigDecimal("18.00"), product.getStockQuantity());
        verify(productRepository, times(1)).save(product);
        verify(cartItemRepository, times(1)).deleteByCartId(10L);
    }

    @Test
    @DisplayName("Should reject checkout when requested quantity exceeds available stock")
    void testCheckoutInsufficientStockFails() {
        // Consumer wants 25 KG, but only 20 KG available
        cartItem.setQuantity(new BigDecimal("25.00"));

        CheckoutRequest request = CheckoutRequest.builder()
                .recipientName("Priya")
                .phoneNumber("9876543210")
                .streetAddress("123 MG Road")
                .city("Pune")
                .state("Maharashtra")
                .postalCode("411001")
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(consumer));
        when(cartRepository.findByUserId(2L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class, () -> orderService.checkout(2L, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should restore inventory when order is cancelled by consumer")
    void testOrderCancellationRestoresInventory() {
        Order order = Order.builder()
                .id(500L)
                .orderNumber("F2D-TEST-001")
                .consumer(consumer)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("100.00"))
                .items(new ArrayList<>())
                .statusHistory(new ArrayList<>())
                .build();

        OrderItem item = OrderItem.builder()
                .id(1L)
                .order(order)
                .product(product)
                .farmer(farmer)
                .productTitleSnapshot("Organic Tomatoes")
                .unitPriceSnapshot(new BigDecimal("50.00"))
                .unitSnapshot(ProductUnit.KG)
                .quantity(new BigDecimal("4.00"))
                .subtotal(new BigDecimal("200.00"))
                .fulfillmentStatus(OrderStatus.PENDING)
                .build();

        order.getItems().add(item);

        // Product had 16 KG remaining
        product.setStockQuantity(new BigDecimal("16.00"));

        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(userRepository.findById(2L)).thenReturn(Optional.of(consumer));

        OrderCancelRequest cancelReq = OrderCancelRequest.builder()
                .reason("Changed plans")
                .build();

        OrderResponse res = orderService.cancelOrder(500L, 2L, cancelReq);

        assertNotNull(res);
        assertEquals(OrderStatus.CANCELLED, res.getStatus());
        // 16 + 4 = 20 restored!
        assertEquals(new BigDecimal("20.00"), product.getStockQuantity());
        verify(productRepository, times(1)).save(product);
    }
}

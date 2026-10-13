package com.farm2door.service;

import com.farm2door.dto.*;
import com.farm2door.entity.*;
import com.farm2door.enums.NotificationType;
import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.PaymentMethod;
import com.farm2door.enums.PaymentStatus;
import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.Role;
import com.farm2door.exception.BadRequestException;
import com.farm2door.exception.InsufficientStockException;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.exception.UnauthorizedException;
import com.farm2door.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final NotificationService notificationService;

    private static final BigDecimal FIXED_DELIVERY_FEE = new BigDecimal("40.00");
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500.00");
    private static final BigDecimal LOW_STOCK_THRESHOLD = new BigDecimal("10.00");

    @Transactional
    public OrderResponse checkout(Long consumerId, CheckoutRequest request) {
        User consumer = userRepository.findById(consumerId)
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with id: " + consumerId));

        Cart cart = cartRepository.findByUserId(consumerId)
                .orElseThrow(() -> new BadRequestException("No cart found for user"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your shopping cart is empty");
        }

        // Validate stock and compute real prices from database
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getId()));

            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BadRequestException("Product '" + product.getTitle() + "' is currently unavailable");
            }

            if (product.getStockQuantity().compareTo(cartItem.getQuantity()) < 0) {
                throw new InsufficientStockException("Insufficient stock for '" + product.getTitle() +
                        "'. Requested: " + cartItem.getQuantity() + " " + product.getUnit() +
                        ", Available: " + product.getStockQuantity() + " " + product.getUnit());
            }

            BigDecimal itemPrice = product.getPricePerUnit();
            BigDecimal itemTotal = itemPrice.multiply(cartItem.getQuantity());
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .farmer(product.getFarmer())
                    .productTitleSnapshot(product.getTitle())
                    .unitPriceSnapshot(itemPrice)
                    .unitSnapshot(product.getUnit())
                    .quantity(cartItem.getQuantity())
                    .subtotal(itemTotal)
                    .fulfillmentStatus(OrderStatus.PENDING)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (subtotal.compareTo(FREE_DELIVERY_THRESHOLD) < 0) {
            deliveryFee = FIXED_DELIVERY_FEE;
        }
        BigDecimal totalAmount = subtotal.add(deliveryFee);

        // Deduct inventory atomically
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            BigDecimal remainingStock = product.getStockQuantity().subtract(cartItem.getQuantity());
            product.setStockQuantity(remainingStock);

            if (remainingStock.compareTo(BigDecimal.ZERO) <= 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);

            // Trigger low stock warning if needed
            if (remainingStock.compareTo(LOW_STOCK_THRESHOLD) <= 0) {
                notificationService.createNotification(
                        product.getFarmer().getId(),
                        "Low Stock Alert: " + product.getTitle(),
                        "Remaining stock: " + remainingStock + " " + product.getUnit() + " after order placement.",
                        NotificationType.LOW_STOCK,
                        "PRODUCT",
                        product.getId()
                );
            }
        }

        // Generate unique order number
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String orderNumber = "F2D-" + datePrefix + "-" + randomSuffix;

        Address address = null;
        if (request.getAddressId() != null) {
            address = addressRepository.findById(request.getAddressId()).orElse(null);
        }

        String deliveryAddressText = request.getStreetAddress() + ", " + request.getCity() + ", " +
                request.getState() + " - " + request.getPostalCode();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .consumer(consumer)
                .address(address)
                .deliveryRecipientName(request.getRecipientName().trim())
                .deliveryPhone(request.getPhoneNumber().trim())
                .deliveryAddressText(deliveryAddressText)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(PaymentStatus.PENDING)
                .subtotalAmount(subtotal)
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Link items to order
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }
        savedOrder.setItems(orderItems);

        // Create Payment record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(savedOrder.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(totalAmount)
                .transactionId("COD-" + savedOrder.getOrderNumber())
                .build();
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // Record Initial History Status
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.PENDING)
                .notes("Order placed via Cash on Delivery")
                .changedBy(consumer)
                .build();
        orderStatusHistoryRepository.save(history);
        savedOrder.getStatusHistory().add(history);

        // Clear shopping cart
        cartItemRepository.deleteByCartId(cart.getId());

        // Notify Consumer
        notificationService.createNotification(
                consumer.getId(),
                "Order Placed Successfully: " + savedOrder.getOrderNumber(),
                "Your order #" + savedOrder.getOrderNumber() + " of amount " + savedOrder.getTotalAmount() + " has been placed.",
                NotificationType.ORDER_CREATED,
                "ORDER",
                savedOrder.getId()
        );

        // Notify each Farmer involved
        Set<Long> notifiedFarmers = new HashSet<>();
        for (OrderItem item : orderItems) {
            Long farmerId = item.getFarmer().getId();
            if (notifiedFarmers.add(farmerId)) {
                notificationService.createNotification(
                        farmerId,
                        "New Order Received: " + savedOrder.getOrderNumber(),
                        "You have received an order for your farm products. Order #" + savedOrder.getOrderNumber(),
                        NotificationType.ORDER_CREATED,
                        "ORDER",
                        savedOrder.getId()
                );
            }
        }

        log.info("Order created successfully: {} by consumer {}", savedOrder.getOrderNumber(), consumer.getEmail());

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getConsumerOrders(Long consumerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByConsumerId(consumerId, pageable);
        return PageResponse.from(orderPage.map(this::mapToOrderResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getFarmerOrders(Long farmerId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findOrdersByFarmerIdAndStatus(farmerId, status, pageable);
        } else {
            orderPage = orderRepository.findOrdersByFarmerId(farmerId, pageable);
        }
        return PageResponse.from(orderPage.map(this::mapToOrderResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrdersForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findAll(pageable);
        return PageResponse.from(orderPage.map(this::mapToOrderResponse));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber, Long currentUserId, Role currentUserRole) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        enforceOrderAccess(order, currentUserId, currentUserRole);
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, Long currentUserId, Role currentUserRole) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        enforceOrderAccess(order, currentUserId, currentUserRole);
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Long currentUserId, Role currentUserRole, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        enforceOrderAccess(order, currentUserId, currentUserRole);

        OrderStatus targetStatus = request.getStatus();
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.REJECTED) {
            throw new BadRequestException("Cannot change status of a closed order (" + currentStatus + ")");
        }

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order is already DELIVERED and closed");
        }

        // Validate state machine progression
        validateTransition(currentStatus, targetStatus, currentUserRole);

        User actingUser = userRepository.findById(currentUserId).orElse(null);

        // If target is REJECTED or CANCELLED, restore inventory
        if (targetStatus == OrderStatus.CANCELLED || targetStatus == OrderStatus.REJECTED) {
            restoreOrderInventory(order);
            if (targetStatus == OrderStatus.CANCELLED && request.getNotes() != null) {
                order.setCancellationReason(request.getNotes());
            }
        }

        // If target is DELIVERED, mark COD payment completed
        if (targetStatus == OrderStatus.DELIVERED) {
            if (order.getPayment() != null) {
                order.getPayment().setPaymentStatus(PaymentStatus.COMPLETED);
                paymentRepository.save(order.getPayment());
            }
            order.setPaymentStatus(PaymentStatus.COMPLETED);
        }

        order.setStatus(targetStatus);
        Order updated = orderRepository.save(order);

        // Update fulfillment status on items
        for (OrderItem item : order.getItems()) {
            if (currentUserRole == Role.ROLE_ADMIN || item.getFarmer().getId().equals(currentUserId)) {
                item.setFulfillmentStatus(targetStatus);
                orderItemRepository.save(item);
            }
        }

        // Append to history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(updated)
                .status(targetStatus)
                .notes(request.getNotes() != null ? request.getNotes() : "Status updated to " + targetStatus)
                .changedBy(actingUser)
                .build();
        orderStatusHistoryRepository.save(history);

        // Notify Consumer
        notificationService.createNotification(
                order.getConsumer().getId(),
                "Order " + order.getOrderNumber() + " is " + targetStatus,
                "Your order status has been updated to: " + targetStatus + (request.getNotes() != null ? " (" + request.getNotes() + ")" : ""),
                NotificationType.ORDER_STATUS,
                "ORDER",
                order.getId()
        );

        log.info("Order {} status changed from {} to {} by user {}", order.getOrderNumber(), currentStatus, targetStatus, currentUserId);

        return mapToOrderResponse(updated);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long consumerId, OrderCancelRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getConsumer().getId().equals(consumerId)) {
            throw new UnauthorizedException("You are not authorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Orders can only be cancelled when in PENDING or ACCEPTED status. Current status: " + order.getStatus());
        }

        // Restore stock
        restoreOrderInventory(order);

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason());
        Order updated = orderRepository.save(order);

        User consumer = userRepository.findById(consumerId).orElse(null);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(updated)
                .status(OrderStatus.CANCELLED)
                .notes("Cancelled by consumer. Reason: " + request.getReason())
                .changedBy(consumer)
                .build();
        orderStatusHistoryRepository.save(history);

        // Notify farmers
        Set<Long> farmerIds = order.getItems().stream().map(i -> i.getFarmer().getId()).collect(Collectors.toSet());
        for (Long farmerId : farmerIds) {
            notificationService.createNotification(
                    farmerId,
                    "Order Cancelled: " + order.getOrderNumber(),
                    "Order #" + order.getOrderNumber() + " was cancelled by consumer. Inventory has been restored.",
                    NotificationType.ORDER_STATUS,
                    "ORDER",
                    order.getId()
            );
        }

        log.info("Order {} cancelled by consumer {}", order.getOrderNumber(), consumerId);

        return mapToOrderResponse(updated);
    }

    private void restoreOrderInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            BigDecimal restoredQty = product.getStockQuantity().add(item.getQuantity());
            product.setStockQuantity(restoredQty);

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK && restoredQty.compareTo(BigDecimal.ZERO) > 0) {
                product.setStatus(ProductStatus.ACTIVE);
            }
            productRepository.save(product);
        }
        log.debug("Restored inventory for cancelled order {}", order.getOrderNumber());
    }

    private void validateTransition(OrderStatus current, OrderStatus target, Role role) {
        if (role == Role.ROLE_ADMIN) {
            return; // Admin can perform administrative state transitions
        }

        switch (current) {
            case PENDING -> {
                if (target != OrderStatus.ACCEPTED && target != OrderStatus.REJECTED && target != OrderStatus.CANCELLED) {
                    throw new BadRequestException("Invalid transition from PENDING to " + target + ". Allowed: ACCEPTED, REJECTED, CANCELLED.");
                }
            }
            case ACCEPTED -> {
                if (target != OrderStatus.PROCESSING && target != OrderStatus.CANCELLED) {
                    throw new BadRequestException("Invalid transition from ACCEPTED to " + target + ". Allowed: PROCESSING, CANCELLED.");
                }
            }
            case PROCESSING -> {
                if (target != OrderStatus.READY_FOR_DISPATCH) {
                    throw new BadRequestException("Invalid transition from PROCESSING to " + target + ". Allowed: READY_FOR_DISPATCH.");
                }
            }
            case READY_FOR_DISPATCH -> {
                if (target != OrderStatus.DISPATCHED) {
                    throw new BadRequestException("Invalid transition from READY_FOR_DISPATCH to " + target + ". Allowed: DISPATCHED.");
                }
            }
            case DISPATCHED -> {
                if (target != OrderStatus.DELIVERED) {
                    throw new BadRequestException("Invalid transition from DISPATCHED to " + target + ". Allowed: DELIVERED.");
                }
            }
            default -> throw new BadRequestException("No transitions permitted from " + current);
        }
    }

    private void enforceOrderAccess(Order order, Long currentUserId, Role currentUserRole) {
        if (currentUserRole == Role.ROLE_ADMIN) {
            return;
        }

        if (currentUserRole == Role.ROLE_CONSUMER) {
            if (!order.getConsumer().getId().equals(currentUserId)) {
                throw new UnauthorizedException("You are not authorized to view this order");
            }
            return;
        }

        if (currentUserRole == Role.ROLE_FARMER) {
            boolean hasFarmerItem = order.getItems().stream()
                    .anyMatch(item -> item.getFarmer().getId().equals(currentUserId));
            if (!hasFarmerItem) {
                throw new UnauthorizedException("You are not authorized to view this order");
            }
        }
    }

    public OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null ?
                order.getItems().stream().map(this::mapToOrderItemResponse).collect(Collectors.toList()) :
                List.of();

        List<OrderStatusHistoryResponse> historyResponses = order.getStatusHistory() != null ?
                order.getStatusHistory().stream().map(this::mapToHistoryResponse).collect(Collectors.toList()) :
                List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .consumerId(order.getConsumer().getId())
                .consumerName(order.getConsumer().getFullName())
                .consumerEmail(order.getConsumer().getEmail())
                .consumerPhone(order.getConsumer().getPhone())
                .addressId(order.getAddress() != null ? order.getAddress().getId() : null)
                .deliveryRecipientName(order.getDeliveryRecipientName())
                .deliveryPhone(order.getDeliveryPhone())
                .deliveryAddressText(order.getDeliveryAddressText())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .subtotalAmount(order.getSubtotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .cancellationReason(order.getCancellationReason())
                .notes(order.getNotes())
                .items(itemResponses)
                .statusHistory(historyResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        String farmName = null;
        if (item.getFarmer().getFarmerProfile() != null) {
            farmName = item.getFarmer().getFarmerProfile().getFarmName();
        }

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .farmerId(item.getFarmer().getId())
                .farmerName(item.getFarmer().getFullName())
                .farmName(farmName != null ? farmName : item.getFarmer().getFullName())
                .productTitleSnapshot(item.getProductTitleSnapshot())
                .unitPriceSnapshot(item.getUnitPriceSnapshot())
                .unitSnapshot(item.getUnitSnapshot())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .fulfillmentStatus(item.getFulfillmentStatus())
                .productImageUrl(item.getProduct().getImageUrl())
                .build();
    }

    private OrderStatusHistoryResponse mapToHistoryResponse(OrderStatusHistory history) {
        return OrderStatusHistoryResponse.builder()
                .id(history.getId())
                .status(history.getStatus())
                .notes(history.getNotes())
                .changedByName(history.getChangedBy() != null ? history.getChangedBy().getFullName() : "System")
                .createdAt(history.getCreatedAt())
                .build();
    }
}

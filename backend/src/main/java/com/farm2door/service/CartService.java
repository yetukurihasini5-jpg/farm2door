package com.farm2door.service;

import com.farm2door.dto.CartItemRequest;
import com.farm2door.dto.CartItemResponse;
import com.farm2door.dto.CartResponse;
import com.farm2door.entity.Cart;
import com.farm2door.entity.CartItem;
import com.farm2door.entity.Product;
import com.farm2door.entity.User;
import com.farm2door.enums.ProductStatus;
import com.farm2door.exception.BadRequestException;
import com.farm2door.exception.InsufficientStockException;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.repository.CartItemRepository;
import com.farm2door.repository.CartRepository;
import com.farm2door.repository.ProductRepository;
import com.farm2door.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final BigDecimal FIXED_DELIVERY_FEE = new BigDecimal("40.00");
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500.00");

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("Product is not currently available for purchase");
        }

        // Prevent farmer from purchasing their own product
        if (product.getFarmer().getId().equals(userId)) {
            throw new BadRequestException("Farmers cannot add their own products to cart");
        }

        BigDecimal requestedQty = request.getQuantity();
        if (requestedQty.compareTo(product.getMinOrderQuantity()) < 0) {
            throw new BadRequestException("Minimum order quantity for this product is " + product.getMinOrderQuantity() + " " + product.getUnit());
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            BigDecimal newTotalQty = item.getQuantity().add(requestedQty);

            if (newTotalQty.compareTo(product.getStockQuantity()) > 0) {
                throw new InsufficientStockException("Insufficient stock for " + product.getTitle() + ". Available: " + product.getStockQuantity() + " " + product.getUnit());
            }

            item.setQuantity(newTotalQty);
            item.setUnitPrice(product.getPricePerUnit()); // always sync with latest product price
            cartItemRepository.save(item);
        } else {
            if (requestedQty.compareTo(product.getStockQuantity()) > 0) {
                throw new InsufficientStockException("Insufficient stock for " + product.getTitle() + ". Available: " + product.getStockQuantity() + " " + product.getUnit());
            }

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(requestedQty)
                    .unitPrice(product.getPricePerUnit())
                    .build();

            cartItemRepository.save(newItem);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long userId, Long cartItemId, BigDecimal newQuantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            cartItemRepository.delete(item);
            return getCart(userId);
        }

        Product product = item.getProduct();
        if (newQuantity.compareTo(product.getStockQuantity()) > 0) {
            throw new InsufficientStockException("Insufficient stock for " + product.getTitle() + ". Available: " + product.getStockQuantity() + " " + product.getUnit());
        }

        if (newQuantity.compareTo(product.getMinOrderQuantity()) < 0) {
            throw new BadRequestException("Minimum order quantity is " + product.getMinOrderQuantity() + " " + product.getUnit());
        }

        item.setQuantity(newQuantity);
        item.setUnitPrice(product.getPricePerUnit()); // re-sync price
        cartItemRepository.save(item);

        return getCart(userId);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    public CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItemCount = 0;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            // Recheck current price from product entity
            BigDecimal currentPrice = product.getPricePerUnit();
            BigDecimal itemSubtotal = currentPrice.multiply(item.getQuantity());
            subtotal = subtotal.add(itemSubtotal);
            totalItemCount++;

            boolean isAvailable = (product.getStatus() == ProductStatus.ACTIVE)
                    && (product.getStockQuantity().compareTo(item.getQuantity()) >= 0);

            String farmName = null;
            if (product.getFarmer().getFarmerProfile() != null) {
                farmName = product.getFarmer().getFarmerProfile().getFarmName();
            }

            itemResponses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(product.getId())
                    .productTitle(product.getTitle())
                    .productImageUrl(product.getImageUrl())
                    .unit(product.getUnit())
                    .unitPrice(currentPrice)
                    .quantity(item.getQuantity())
                    .availableStock(product.getStockQuantity())
                    .subtotal(itemSubtotal)
                    .farmerId(product.getFarmer().getId())
                    .farmName(farmName != null ? farmName : product.getFarmer().getFullName())
                    .isAvailable(isAvailable)
                    .build());
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0 && subtotal.compareTo(FREE_DELIVERY_THRESHOLD) < 0) {
            deliveryFee = FIXED_DELIVERY_FEE;
        }

        BigDecimal total = subtotal.add(deliveryFee);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .totalItemCount(totalItemCount)
                .subtotal(subtotal)
                .estimatedDeliveryFee(deliveryFee)
                .total(total)
                .build();
    }
}

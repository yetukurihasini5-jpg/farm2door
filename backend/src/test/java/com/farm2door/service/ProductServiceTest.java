package com.farm2door.service;

import com.farm2door.dto.ProductRequest;
import com.farm2door.dto.ProductResponse;
import com.farm2door.entity.Category;
import com.farm2door.entity.FarmerProfile;
import com.farm2door.entity.Product;
import com.farm2door.entity.User;
import com.farm2door.enums.NotificationType;
import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.ProductUnit;
import com.farm2door.enums.Role;
import com.farm2door.exception.UnauthorizedException;
import com.farm2door.repository.CategoryRepository;
import com.farm2door.repository.ProductRepository;
import com.farm2door.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ProductService productService;

    private User farmer;
    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        farmer = User.builder()
                .id(1L)
                .email("farmer@test.com")
                .fullName("Raju Farmer")
                .role(Role.ROLE_FARMER)
                .farmerProfile(FarmerProfile.builder().farmName("Raju Farms").farmLocation("Nashik").build())
                .build();

        category = Category.builder()
                .id(10L)
                .name("Fresh Vegetables")
                .slug("vegetables")
                .build();

        product = Product.builder()
                .id(100L)
                .farmer(farmer)
                .category(category)
                .title("Organic Tomatoes")
                .pricePerUnit(new BigDecimal("40.00"))
                .stockQuantity(new BigDecimal("50.00"))
                .minOrderQuantity(BigDecimal.ONE)
                .unit(ProductUnit.KG)
                .status(ProductStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should create product and trigger low stock notification if initial stock <= 10")
    void testCreateProductLowStockTrigger() {
        ProductRequest request = ProductRequest.builder()
                .title("Fresh Spinach")
                .categoryId(10L)
                .unit(ProductUnit.BUNCH)
                .pricePerUnit(new BigDecimal("25.00"))
                .stockQuantity(new BigDecimal("8.00")) // <= 10
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(farmer));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(101L);
            return p;
        });

        ProductResponse response = productService.createProduct(1L, request);

        assertNotNull(response);
        assertEquals("Fresh Spinach", response.getTitle());
        verify(notificationService, times(1)).createNotification(
                eq(1L),
                contains("Low Stock Alert"),
                anyString(),
                eq(NotificationType.LOW_STOCK),
                eq("PRODUCT"),
                anyLong()
        );
    }

    @Test
    @DisplayName("Should prevent farmer from updating product belonging to another farmer")
    void testPreventUnauthorizedProductUpdate() {
        ProductRequest updateRequest = ProductRequest.builder()
                .title("Hacked Title")
                .categoryId(10L)
                .unit(ProductUnit.KG)
                .pricePerUnit(new BigDecimal("50.00"))
                .stockQuantity(new BigDecimal("20.00"))
                .build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        // Farmer 999 tries to update Farmer 1's product
        assertThrows(UnauthorizedException.class, () -> productService.updateProduct(100L, 999L, updateRequest));
        verify(productRepository, never()).save(any(Product.class));
    }
}

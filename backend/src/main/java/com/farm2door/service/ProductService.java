package com.farm2door.service;

import com.farm2door.dto.PageResponse;
import com.farm2door.dto.ProductRequest;
import com.farm2door.dto.ProductResponse;
import com.farm2door.entity.Category;
import com.farm2door.entity.Product;
import com.farm2door.entity.ProductImage;
import com.farm2door.entity.User;
import com.farm2door.enums.NotificationType;
import com.farm2door.enums.ProductStatus;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.exception.UnauthorizedException;
import com.farm2door.repository.CategoryRepository;
import com.farm2door.repository.ProductRepository;
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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final BigDecimal LOW_STOCK_THRESHOLD = new BigDecimal("10.00");

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getPublicProducts(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"),
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Product> productPage = productRepository.filterPublicProducts(categoryId, trimmedSearch, minPrice, maxPrice, pageable);
        return PageResponse.from(productPage.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByStatusAndIsFeaturedTrue(ProductStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getFarmerProducts(Long farmerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findByFarmerId(farmerId, pageable);
        return PageResponse.from(productPage.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFarmerLowStockProducts(Long farmerId) {
        return productRepository.findLowStockByFarmerId(farmerId, LOW_STOCK_THRESHOLD).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(Long farmerId, ProductRequest request) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with id: " + farmerId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .farmer(farmer)
                .category(category)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .unit(request.getUnit())
                .pricePerUnit(request.getPricePerUnit())
                .stockQuantity(request.getStockQuantity())
                .minOrderQuantity(request.getMinOrderQuantity() != null ? request.getMinOrderQuantity() : BigDecimal.ONE)
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isEmpty() ? request.getImageUrl() : "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80")
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE)
                .isFeatured(Boolean.TRUE.equals(request.getIsFeatured()))
                .build();

        Product saved = productRepository.save(product);

        if (saved.getStockQuantity().compareTo(LOW_STOCK_THRESHOLD) <= 0) {
            notificationService.createNotification(
                    farmerId,
                    "Low Stock Alert: " + saved.getTitle(),
                    "Your product '" + saved.getTitle() + "' has low initial stock (" + saved.getStockQuantity() + " " + saved.getUnit() + ").",
                    NotificationType.LOW_STOCK,
                    "PRODUCT",
                    saved.getId()
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, Long farmerId, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Strict ownership check: farmers can only modify their own products!
        if (!product.getFarmer().getId().equals(farmerId)) {
            throw new UnauthorizedException("You are not authorized to edit this product");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setCategory(category);
        product.setTitle(request.getTitle().trim());
        product.setDescription(request.getDescription());
        product.setUnit(request.getUnit());
        product.setPricePerUnit(request.getPricePerUnit());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getMinOrderQuantity() != null) {
            product.setMinOrderQuantity(request.getMinOrderQuantity());
        }
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }

        // Automatic out of stock status if stock reaches 0
        if (product.getStockQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }

        Product updated = productRepository.save(product);

        // Low stock alert check
        if (updated.getStockQuantity().compareTo(LOW_STOCK_THRESHOLD) <= 0 && updated.getStatus() != ProductStatus.INACTIVE) {
            notificationService.createNotification(
                    farmerId,
                    "Low Stock Warning: " + updated.getTitle(),
                    "Stock remaining: " + updated.getStockQuantity() + " " + updated.getUnit() + ". Please replenish inventory soon.",
                    NotificationType.LOW_STOCK,
                    "PRODUCT",
                    updated.getId()
            );
        }

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id, Long farmerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getFarmer().getId().equals(farmerId)) {
            throw new UnauthorizedException("You are not authorized to delete this product");
        }

        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse toggleProductStatus(Long id, Long farmerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getFarmer().getId().equals(farmerId)) {
            throw new UnauthorizedException("You are not authorized to modify this product");
        }

        if (product.getStatus() == ProductStatus.ACTIVE) {
            product.setStatus(ProductStatus.INACTIVE);
        } else {
            product.setStatus(ProductStatus.ACTIVE);
        }

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public ProductResponse adminSetProductStatus(Long id, ProductStatus status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStatus(status);
        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    public ProductResponse mapToResponse(Product product) {
        String farmName = null;
        String farmLocation = null;
        if (product.getFarmer().getFarmerProfile() != null) {
            farmName = product.getFarmer().getFarmerProfile().getFarmName();
            farmLocation = product.getFarmer().getFarmerProfile().getFarmLocation();
        }

        List<String> imageUrls = product.getImages() != null ?
                product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()) :
                List.of();

        return ProductResponse.builder()
                .id(product.getId())
                .farmerId(product.getFarmer().getId())
                .farmerName(product.getFarmer().getFullName())
                .farmName(farmName != null ? farmName : product.getFarmer().getFullName() + "'s Farm")
                .farmLocation(farmLocation != null ? farmLocation : "Local Farm")
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .title(product.getTitle())
                .description(product.getDescription())
                .unit(product.getUnit())
                .pricePerUnit(product.getPricePerUnit())
                .stockQuantity(product.getStockQuantity())
                .minOrderQuantity(product.getMinOrderQuantity())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .isFeatured(product.getIsFeatured())
                .ratingAverage(product.getRatingAverage())
                .reviewCount(product.getReviewCount())
                .imageUrls(imageUrls)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}

package com.farm2door.repository;

import com.farm2door.entity.Product;
import com.farm2door.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByFarmerId(Long farmerId, Pageable pageable);

    Optional<Product> findByIdAndFarmerId(Long id, Long farmerId);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    List<Product> findByStatusAndIsFeaturedTrue(ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.farmer.id = :farmerId AND p.stockQuantity <= :threshold")
    List<Product> findLowStockByFarmerId(@Param("farmerId") Long farmerId, @Param("threshold") BigDecimal threshold);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:minPrice IS NULL OR p.pricePerUnit >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.pricePerUnit <= :maxPrice)")
    Page<Product> filterPublicProducts(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    long countByStatus(ProductStatus status);

    long countByFarmerId(Long farmerId);
}

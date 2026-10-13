package com.farm2door.repository;

import com.farm2door.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductId(Long productId, Pageable pageable);

    Optional<Review> findByConsumerIdAndProductIdAndOrderId(Long consumerId, Long productId, Long orderId);

    boolean existsByConsumerIdAndProductIdAndOrderId(Long consumerId, Long productId, Long orderId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    BigDecimal calculateAverageRating(@Param("productId") Long productId);

    long countByProductId(Long productId);
}

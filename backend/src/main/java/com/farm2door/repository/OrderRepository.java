package com.farm2door.repository;

import com.farm2door.entity.Order;
import com.farm2door.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByConsumerId(Long consumerId, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.farmer.id = :farmerId ORDER BY o.createdAt DESC")
    Page<Order> findOrdersByFarmerId(@Param("farmerId") Long farmerId, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.farmer.id = :farmerId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findOrdersByFarmerIdAndStatus(@Param("farmerId") Long farmerId, @Param("status") OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculatePlatformTotalRevenue();

    @Query("SELECT COALESCE(SUM(i.subtotal), 0) FROM OrderItem i WHERE i.farmer.id = :farmerId AND i.order.status = 'DELIVERED'")
    BigDecimal calculateFarmerTotalRevenue(@Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.farmer.id = :farmerId")
    long countOrdersByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.farmer.id = :farmerId AND o.status = :status")
    long countOrdersByFarmerIdAndStatus(@Param("farmerId") Long farmerId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE (:status IS NULL OR o.status = :status) " +
           "AND (:startDate IS NULL OR o.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR o.createdAt <= :endDate)")
    List<Order> findOrdersForReport(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}

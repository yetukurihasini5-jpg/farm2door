package com.farm2door.repository;

import com.farm2door.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByFarmerId(Long farmerId);

    @Query("SELECT i.productTitleSnapshot, SUM(i.quantity), SUM(i.subtotal) " +
           "FROM OrderItem i WHERE i.order.status = 'DELIVERED' " +
           "GROUP BY i.productTitleSnapshot ORDER BY SUM(i.quantity) DESC")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT i.farmer.fullName, COUNT(DISTINCT i.order.id), SUM(i.subtotal) " +
           "FROM OrderItem i WHERE i.order.status = 'DELIVERED' " +
           "GROUP BY i.farmer.id, i.farmer.fullName ORDER BY SUM(i.subtotal) DESC")
    List<Object[]> findFarmerSalesSummary();
}

package com.farm2door.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private long activeProducts;
    private long totalFarmers;
    private long totalConsumers;
    private long lowStockAlertsCount;
    private List<ProductResponse> lowStockProducts;
    private List<OrderResponse> recentOrders;
}

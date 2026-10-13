package com.farm2door.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportResponse {
    private BigDecimal totalSalesAmount;
    private long totalOrdersCount;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private List<TopSellingProductItem> topProducts;
    private List<FarmerSalesSummaryItem> farmerSummaries;
    private List<OrderResponse> orders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingProductItem {
        private String productName;
        private BigDecimal quantitySold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FarmerSalesSummaryItem {
        private String farmerName;
        private long ordersCount;
        private BigDecimal totalRevenue;
    }
}

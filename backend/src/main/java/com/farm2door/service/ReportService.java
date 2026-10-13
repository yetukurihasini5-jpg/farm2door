package com.farm2door.service;

import com.farm2door.dto.OrderResponse;
import com.farm2door.dto.SalesReportResponse;
import com.farm2door.entity.Order;
import com.farm2door.enums.OrderStatus;
import com.farm2door.repository.OrderItemRepository;
import com.farm2door.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderService orderService;

    @Transactional(readOnly = true)
    public SalesReportResponse generateSalesReport(LocalDateTime startDate, LocalDateTime endDate, OrderStatus status) {
        List<Order> orders = orderRepository.findOrdersForReport(status, startDate, endDate);

        BigDecimal totalSales = BigDecimal.ZERO;
        for (Order o : orders) {
            if (o.getStatus() == OrderStatus.DELIVERED) {
                totalSales = totalSales.add(o.getTotalAmount());
            }
        }

        // Top selling products aggregation
        List<Object[]> rawTop = orderItemRepository.findTopSellingProducts();
        List<SalesReportResponse.TopSellingProductItem> topProducts = new ArrayList<>();
        for (Object[] row : rawTop) {
            String title = (String) row[0];
            BigDecimal quantity = (BigDecimal) row[1];
            BigDecimal revenue = (BigDecimal) row[2];
            topProducts.add(SalesReportResponse.TopSellingProductItem.builder()
                    .productName(title)
                    .quantitySold(quantity)
                    .totalRevenue(revenue)
                    .build());
        }

        // Farmer performance aggregation
        List<Object[]> rawFarmers = orderItemRepository.findFarmerSalesSummary();
        List<SalesReportResponse.FarmerSalesSummaryItem> farmerSummaries = new ArrayList<>();
        for (Object[] row : rawFarmers) {
            String name = (String) row[0];
            long count = ((Number) row[1]).longValue();
            BigDecimal revenue = (BigDecimal) row[2];
            farmerSummaries.add(SalesReportResponse.FarmerSalesSummaryItem.builder()
                    .farmerName(name)
                    .ordersCount(count)
                    .totalRevenue(revenue)
                    .build());
        }

        List<OrderResponse> orderResponses = orders.stream()
                .map(orderService::mapToOrderResponse)
                .collect(Collectors.toList());

        return SalesReportResponse.builder()
                .totalSalesAmount(totalSales)
                .totalOrdersCount(orders.size())
                .dateFrom(startDate)
                .dateTo(endDate)
                .topProducts(topProducts)
                .farmerSummaries(farmerSummaries)
                .orders(orderResponses)
                .build();
    }

    public ByteArrayInputStream exportOrdersCsv(LocalDateTime startDate, LocalDateTime endDate, OrderStatus status) {
        List<Order> orders = orderRepository.findOrdersForReport(status, startDate, endDate);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            // Header
            writer.println("Order Number,Order Date,Consumer Name,Consumer Email,Delivery Address,Status,Payment Method,Payment Status,Subtotal,Delivery Fee,Total Amount");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Order order : orders) {
                String cleanAddress = order.getDeliveryAddressText().replace("\"", "\"\"").replace("\n", " ");
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f%n",
                        order.getOrderNumber(),
                        order.getCreatedAt().format(formatter),
                        order.getConsumer().getFullName(),
                        order.getConsumer().getEmail(),
                        cleanAddress,
                        order.getStatus(),
                        order.getPaymentMethod(),
                        order.getPaymentStatus(),
                        order.getSubtotalAmount(),
                        order.getDeliveryFee(),
                        order.getTotalAmount()
                );
            }
            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}

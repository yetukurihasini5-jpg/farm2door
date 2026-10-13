package com.farm2door.service;

import com.farm2door.dto.DashboardStatsResponse;
import com.farm2door.dto.FarmerProfileRequest;
import com.farm2door.dto.FarmerProfileResponse;
import com.farm2door.dto.ProductResponse;
import com.farm2door.entity.FarmerProfile;
import com.farm2door.entity.User;
import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.Role;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.repository.FarmerProfileRepository;
import com.farm2door.repository.OrderRepository;
import com.farm2door.repository.ProductRepository;
import com.farm2door.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final OrderService orderService;

    @Transactional(readOnly = true)
    public FarmerProfileResponse getFarmerProfile(Long userId) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user id: " + userId));

        return mapToResponse(profile);
    }

    @Transactional
    public FarmerProfileResponse updateFarmerProfile(Long userId, FarmerProfileRequest request) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    return FarmerProfile.builder().user(user).build();
                });

        profile.setFarmName(request.getFarmName().trim());
        profile.setFarmLocation(request.getFarmLocation().trim());
        if (request.getFarmSizeAcres() != null) {
            profile.setFarmSizeAcres(request.getFarmSizeAcres());
        }
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        FarmerProfile saved = farmerProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getFarmerDashboardStats(Long farmerId) {
        BigDecimal revenue = orderRepository.calculateFarmerTotalRevenue(farmerId);
        long totalOrders = orderRepository.countOrdersByFarmerId(farmerId);
        long pendingOrders = orderRepository.countOrdersByFarmerIdAndStatus(farmerId, OrderStatus.PENDING);
        long completedOrders = orderRepository.countOrdersByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);
        long activeProducts = productRepository.countByFarmerId(farmerId);

        List<ProductResponse> lowStockProducts = productService.getFarmerLowStockProducts(farmerId);
        var recentOrders = orderService.getFarmerOrders(farmerId, null, 0, 5).getContent();

        return DashboardStatsResponse.builder()
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .activeProducts(activeProducts)
                .lowStockAlertsCount(lowStockProducts.size())
                .lowStockProducts(lowStockProducts)
                .recentOrders(recentOrders)
                .build();
    }

    public FarmerProfileResponse mapToResponse(FarmerProfile profile) {
        return FarmerProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .farmerName(profile.getUser().getFullName())
                .farmName(profile.getFarmName())
                .farmLocation(profile.getFarmLocation())
                .farmSizeAcres(profile.getFarmSizeAcres())
                .experienceYears(profile.getExperienceYears())
                .bio(profile.getBio())
                .isVerified(profile.getIsVerified())
                .build();
    }
}

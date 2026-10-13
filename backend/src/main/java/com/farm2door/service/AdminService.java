package com.farm2door.service;

import com.farm2door.dto.DashboardStatsResponse;
import com.farm2door.dto.PageResponse;
import com.farm2door.dto.UserResponse;
import com.farm2door.entity.FarmerProfile;
import com.farm2door.entity.User;
import com.farm2door.enums.OrderStatus;
import com.farm2door.enums.ProductStatus;
import com.farm2door.enums.Role;
import com.farm2door.exception.BadRequestException;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.repository.FarmerProfileRepository;
import com.farm2door.repository.OrderRepository;
import com.farm2door.repository.ProductRepository;
import com.farm2door.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final OrderService orderService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getAdminDashboardStats() {
        BigDecimal totalRevenue = orderRepository.calculatePlatformTotalRevenue();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long activeProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        long totalFarmers = userRepository.countByRole(Role.ROLE_FARMER);
        long totalConsumers = userRepository.countByRole(Role.ROLE_CONSUMER);

        var recentOrders = orderService.getAllOrdersForAdmin(0, 5).getContent();

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .activeProducts(activeProducts)
                .totalFarmers(totalFarmers)
                .totalConsumers(totalConsumers)
                .recentOrders(recentOrders)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Role role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage;
        if (role != null) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        return PageResponse.from(userPage.map(userService::mapToUserResponse));
    }

    @Transactional
    public UserResponse toggleUserActivation(Long userId, Long adminUserId) {
        if (userId.equals(adminUserId)) {
            throw new BadRequestException("Administrators cannot deactivate their own account");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(!user.getIsActive());
        User updated = userRepository.save(user);
        return userService.mapToUserResponse(updated);
    }

    @Transactional
    public void toggleFarmerVerification(Long farmerProfileId) {
        FarmerProfile profile = farmerProfileRepository.findById(farmerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found with id: " + farmerProfileId));

        profile.setIsVerified(!profile.getIsVerified());
        farmerProfileRepository.save(profile);
    }
}

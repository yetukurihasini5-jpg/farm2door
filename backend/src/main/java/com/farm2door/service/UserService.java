package com.farm2door.service;

import com.farm2door.dto.ConsumerProfileResponse;
import com.farm2door.dto.FarmerProfileResponse;
import com.farm2door.dto.UserResponse;
import com.farm2door.entity.ConsumerProfile;
import com.farm2door.entity.FarmerProfile;
import com.farm2door.entity.User;
import com.farm2door.exception.BadRequestException;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateBasicProfile(Long userId, String fullName, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }
        if (phone != null) {
            user.setPhone(phone.trim());
        }

        User updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse mapToUserResponse(User user) {
        FarmerProfileResponse farmerProfileResponse = null;
        if (user.getFarmerProfile() != null) {
            FarmerProfile fp = user.getFarmerProfile();
            farmerProfileResponse = FarmerProfileResponse.builder()
                    .id(fp.getId())
                    .userId(user.getId())
                    .farmerName(user.getFullName())
                    .farmName(fp.getFarmName())
                    .farmLocation(fp.getFarmLocation())
                    .farmSizeAcres(fp.getFarmSizeAcres())
                    .experienceYears(fp.getExperienceYears())
                    .bio(fp.getBio())
                    .isVerified(fp.getIsVerified())
                    .build();
        }

        ConsumerProfileResponse consumerProfileResponse = null;
        if (user.getConsumerProfile() != null) {
            ConsumerProfile cp = user.getConsumerProfile();
            consumerProfileResponse = ConsumerProfileResponse.builder()
                    .id(cp.getId())
                    .userId(user.getId())
                    .defaultPhone(cp.getDefaultPhone())
                    .preferredLanguage(cp.getPreferredLanguage())
                    .build();
        }

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .farmerProfile(farmerProfileResponse)
                .consumerProfile(consumerProfileResponse)
                .build();
    }
}

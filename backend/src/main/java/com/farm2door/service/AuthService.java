package com.farm2door.service;

import com.farm2door.dto.AuthResponse;
import com.farm2door.dto.LoginRequest;
import com.farm2door.dto.RegisterRequest;
import com.farm2door.entity.Cart;
import com.farm2door.entity.ConsumerProfile;
import com.farm2door.entity.FarmerProfile;
import com.farm2door.entity.User;
import com.farm2door.enums.Role;
import com.farm2door.exception.BadRequestException;
import com.farm2door.repository.CartRepository;
import com.farm2door.repository.ConsumerProfileRepository;
import com.farm2door.repository.FarmerProfileRepository;
import com.farm2door.repository.UserRepository;
import com.farm2door.security.JwtUtils;
import com.farm2door.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final ConsumerProfileRepository consumerProfileRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.ROLE_CONSUMER;

        // Security rule: Never allow public registration to create an Admin account!
        if (assignedRole == Role.ROLE_ADMIN) {
            throw new BadRequestException("Administrative accounts cannot be created via public registration");
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(assignedRole)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        Long profileId = null;
        String farmName = null;

        if (assignedRole == Role.ROLE_FARMER) {
            farmName = request.getFarmName() != null ? request.getFarmName() : (savedUser.getFullName() + "'s Farm");
            String farmLocation = request.getFarmLocation() != null ? request.getFarmLocation() : "Local Farm";

            FarmerProfile farmerProfile = FarmerProfile.builder()
                    .user(savedUser)
                    .farmName(farmName)
                    .farmLocation(farmLocation)
                    .farmSizeAcres(request.getFarmSizeAcres() != null ? request.getFarmSizeAcres() : BigDecimal.ZERO)
                    .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                    .bio(request.getBio())
                    .isVerified(false)
                    .build();

            FarmerProfile savedProfile = farmerProfileRepository.save(farmerProfile);
            profileId = savedProfile.getId();
        } else if (assignedRole == Role.ROLE_CONSUMER) {
            ConsumerProfile consumerProfile = ConsumerProfile.builder()
                    .user(savedUser)
                    .defaultPhone(savedUser.getPhone())
                    .preferredLanguage("English")
                    .build();

            ConsumerProfile savedProfile = consumerProfileRepository.save(consumerProfile);
            profileId = savedProfile.getId();

            // Initialize shopping cart
            Cart cart = Cart.builder()
                    .user(savedUser)
                    .build();
            cartRepository.save(cart);
        }

        String token = jwtUtils.generateTokenFromUsername(savedUser.getEmail());

        log.info("Registered new user with email: {} and role: {}", savedUser.getEmail(), savedUser.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole())
                .profileId(profileId)
                .farmName(farmName)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Your account has been deactivated. Please contact support.");
        }

        Long profileId = null;
        String farmName = null;

        if (user.getRole() == Role.ROLE_FARMER && user.getFarmerProfile() != null) {
            profileId = user.getFarmerProfile().getId();
            farmName = user.getFarmerProfile().getFarmName();
        } else if (user.getRole() == Role.ROLE_CONSUMER && user.getConsumerProfile() != null) {
            profileId = user.getConsumerProfile().getId();
        }

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileId(profileId)
                .farmName(farmName)
                .build();
    }
}

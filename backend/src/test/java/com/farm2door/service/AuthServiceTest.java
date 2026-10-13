package com.farm2door.service;

import com.farm2door.dto.AuthResponse;
import com.farm2door.dto.LoginRequest;
import com.farm2door.dto.RegisterRequest;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @Mock
    private ConsumerProfileRepository consumerProfileRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User sampleFarmer;
    private User sampleConsumer;

    @BeforeEach
    void setUp() {
        sampleFarmer = User.builder()
                .id(1L)
                .email("farmer@test.com")
                .password("encoded_pass")
                .fullName("Test Farmer")
                .role(Role.ROLE_FARMER)
                .isActive(true)
                .build();

        sampleConsumer = User.builder()
                .id(2L)
                .email("consumer@test.com")
                .password("encoded_pass")
                .fullName("Test Consumer")
                .role(Role.ROLE_CONSUMER)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new farmer and create farm profile")
    void testRegisterFarmerSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .email("newfarmer@test.com")
                .password("farmer123")
                .fullName("New Farmer")
                .role(Role.ROLE_FARMER)
                .farmName("Green Acres")
                .farmLocation("Punjab")
                .farmSizeAcres(BigDecimal.valueOf(10))
                .build();

        when(userRepository.existsByEmail("newfarmer@test.com")).thenReturn(false);
        when(passwordEncoder.encode("farmer123")).thenReturn("encoded_farmer123");
        when(userRepository.save(any(User.class))).thenReturn(sampleFarmer);
        when(farmerProfileRepository.save(any(FarmerProfile.class))).thenReturn(
                FarmerProfile.builder().id(10L).farmName("Green Acres").build()
        );
        when(jwtUtils.generateTokenFromUsername(anyString())).thenReturn("mock_jwt_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals(Role.ROLE_FARMER, response.getRole());
        verify(farmerProfileRepository, times(1)).save(any(FarmerProfile.class));
    }

    @Test
    @DisplayName("Should reject public registration attempting to register as ROLE_ADMIN")
    void testRegisterAdminFails() {
        RegisterRequest request = RegisterRequest.builder()
                .email("hacker@test.com")
                .password("adminpass")
                .fullName("Hacker Admin")
                .role(Role.ROLE_ADMIN)
                .build();

        when(userRepository.existsByEmail("hacker@test.com")).thenReturn(false);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(exception.getMessage().contains("Administrative accounts cannot be created"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration if email is already taken")
    void testRegisterDuplicateEmailFails() {
        RegisterRequest request = RegisterRequest.builder()
                .email("farmer@test.com")
                .password("farmer123")
                .fullName("Duplicate")
                .role(Role.ROLE_FARMER)
                .build();

        when(userRepository.existsByEmail("farmer@test.com")).thenReturn(true);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(exception.getMessage().contains("already registered"));
    }

    @Test
    @DisplayName("Should login successfully and return JWT token")
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .email("farmer@test.com")
                .password("farmer123")
                .build();

        Authentication auth = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.build(sampleFarmer);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("login_jwt_token");
        when(userRepository.findByEmail("farmer@test.com")).thenReturn(Optional.of(sampleFarmer));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login_jwt_token", response.getToken());
        assertEquals("farmer@test.com", response.getEmail());
    }
}

package com.farm2door.service;

import com.farm2door.dto.AddressRequest;
import com.farm2door.dto.AddressResponse;
import com.farm2door.entity.Address;
import com.farm2door.entity.User;
import com.farm2door.exception.ResourceNotFoundException;
import com.farm2door.repository.AddressRepository;
import com.farm2door.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        return mapToResponse(address);
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Address> existing = addressRepository.findByUserId(userId);
        boolean isFirstAddress = existing.isEmpty();
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault()) || isFirstAddress;

        if (shouldBeDefault) {
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .streetAddress(request.getStreetAddress().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .isDefault(shouldBeDefault)
                .build();

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long id, Long userId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.getIsDefault()) {
            List<Address> existing = addressRepository.findByUserId(userId);
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
            address.setIsDefault(true);
        }

        address.setRecipientName(request.getRecipientName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setStreetAddress(request.getStreetAddress().trim());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());

        Address updated = addressRepository.save(address);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                addressRepository.save(remaining.get(0));
            }
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        List<Address> existing = addressRepository.findByUserId(userId);
        existing.forEach(a -> a.setIsDefault(false));
        addressRepository.saveAll(existing);

        address.setIsDefault(true);
        Address updated = addressRepository.save(address);
        return mapToResponse(updated);
    }

    public AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUser().getId())
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .streetAddress(address.getStreetAddress())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .build();
    }
}

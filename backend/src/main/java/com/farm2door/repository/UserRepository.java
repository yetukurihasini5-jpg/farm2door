package com.farm2door.repository;

import com.farm2door.entity.User;
import com.farm2door.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Page<User> findByRole(Role role, Pageable pageable);
    long countByRole(Role role);
}

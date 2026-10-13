package com.farm2door.repository;

import com.farm2door.entity.ConsumerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsumerProfileRepository extends JpaRepository<ConsumerProfile, Long> {
    Optional<ConsumerProfile> findByUserId(Long userId);
}

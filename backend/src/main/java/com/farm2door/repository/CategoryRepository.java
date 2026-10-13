package com.farm2door.repository;

import com.farm2door.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    Boolean existsByName(String name);
    Boolean existsBySlug(String slug);
    List<Category> findByIsActiveTrue();
}

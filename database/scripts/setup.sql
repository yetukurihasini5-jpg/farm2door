-- setup.sql
-- Farm2Door Database Initialization Script

-- 1. Create database with UTF-8 Unicode support
CREATE DATABASE IF NOT EXISTS farm2door_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE farm2door_db;

-- 2. Grant permissions to application user if required
-- Example:
-- CREATE USER IF NOT EXISTS 'farm2door_user'@'localhost' IDENTIFIED BY 'farm2door_pass';
-- GRANT ALL PRIVILEGES ON farm2door_db.* TO 'farm2door_user'@'localhost';
-- FLUSH PRIVILEGES;

-- 3. Schema tables are automatically managed via Flyway migrations:
-- V1__init_schema.sql - Creates tables: users, farmer_profiles, consumer_profiles,
--                      addresses, categories, products, product_images, carts,
--                      cart_items, orders, order_items, order_status_history,
--                      payments, reviews, notifications.
-- V2__seed_initial_data.sql - Seeds core agricultural categories.

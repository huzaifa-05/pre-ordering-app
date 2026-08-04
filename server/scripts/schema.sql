-- =============================================================
-- Pre-Ordering App Database Schema
-- =============================================================

-- =============================================================
-- ROLES
-- =============================================================

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed role data
-- Seed role data moved to seed.sql

-- =============================================================
-- USERS
-- Custom Email + Password Authentication
-- This table stores application-specific user information.
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role_id INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- =============================================================
-- CATEGORIES
-- =============================================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed category data (example)
-- Seed category data moved to seed.sql

-- =============================================================
-- MENU ITEMS
-- =============================================================

CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(50) PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- =============================================================
-- ORDERS
-- =============================================================

-- =============================================================
-- STATUSES
-- =============================================================

CREATE TABLE IF NOT EXISTS statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed status data
-- Seed status data moved to seed.sql

CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    pickup_time VARCHAR(50),
    notes TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status_id INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_orders_status
        FOREIGN KEY (status_id)
        REFERENCES statuses(id)
);

);

-- =============================================================
-- ORDER ITEMS
-- =============================================================

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    menu_item_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu
        FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id)
);
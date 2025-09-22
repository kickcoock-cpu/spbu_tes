-- Skema Database SPBU Management System

-- Buat database
CREATE DATABASE IF NOT EXISTS spbu_db;
USE spbu_db;

-- Tabel Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel SPBU
CREATE TABLE spbus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    spbu_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE SET NULL
);

-- Tabel Sales
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spbu_id INT NOT NULL,
    operator_id INT NOT NULL,
    pump_number INT NOT NULL,
    fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Deliveries
CREATE TABLE deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spbu_id INT NOT NULL,
    supplier VARCHAR(100) NOT NULL,
    fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    delivery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'approved') DEFAULT 'pending',
    confirmed_by INT NULL,
    approved_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Deposits
CREATE TABLE deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spbu_id INT NOT NULL,
    operator_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'transfer', 'check') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT NULL,
    rejected_by INT NULL,
    deposit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Prices
CREATE TABLE prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spbu_id INT NULL,
    fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Attendance
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spbu_id INT NOT NULL,
    check_in TIMESTAMP NULL,
    check_out TIMESTAMP NULL,
    date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE
);

-- Tabel Adjustments
CREATE TABLE adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spbu_id INT NOT NULL,
    operator_id INT NULL,
    type ENUM('fuel', 'equipment', 'other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT NULL,
    rejected_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Audit
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NULL,
    details JSON NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Roles
INSERT INTO roles (name) VALUES 
('Super Admin'),
('Admin'),
('Operator');

-- Indexes untuk optimasi query
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_spbu ON users(spbu_id);
CREATE INDEX idx_sales_spbu ON sales(spbu_id);
CREATE INDEX idx_sales_operator ON sales(operator_id);
CREATE INDEX idx_deliveries_spbu ON deliveries(spbu_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deposits_spbu ON deposits(spbu_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_prices_fuel ON prices(fuel_type);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_adjustments_spbu ON adjustments(spbu_id);
CREATE INDEX idx_adjustments_status ON adjustments(status);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
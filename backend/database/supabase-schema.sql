-- Skema Database SPBU Management System untuk Supabase (PostgreSQL)

-- Tabel Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel SPBU
CREATE TABLE spbus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    spbu_id INTEGER NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE SET NULL
);

-- Tabel Fuel Types (menggantikan ENUM)
CREATE TABLE fuel_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Sales
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    spbu_id INTEGER NOT NULL,
    operator_id INTEGER NOT NULL,
    pump_number INTEGER NOT NULL,
    fuel_type_id INTEGER NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(id) ON DELETE CASCADE
);

-- Tabel Deliveries
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    spbu_id INTEGER NOT NULL,
    supplier VARCHAR(100) NOT NULL,
    fuel_type_id INTEGER NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    delivery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    confirmed_by INTEGER NULL,
    approved_by INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(id) ON DELETE CASCADE
);

-- Tabel Deposits
CREATE TABLE deposits (
    id SERIAL PRIMARY KEY,
    spbu_id INTEGER NOT NULL,
    operator_id INTEGER NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER NULL,
    rejected_by INTEGER NULL,
    deposit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Prices
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    spbu_id INTEGER NULL,
    fuel_type_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(id) ON DELETE CASCADE
);

-- Tabel Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    spbu_id INTEGER NOT NULL,
    check_in TIMESTAMP NULL,
    check_out TIMESTAMP NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE
);

-- Tabel Adjustments
CREATE TABLE adjustments (
    id SERIAL PRIMARY KEY,
    spbu_id INTEGER NOT NULL,
    operator_id INTEGER NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER NULL,
    rejected_by INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NULL,
    details JSON NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Fuel Types
INSERT INTO fuel_types (name) VALUES 
('Premium'),
('Pertamax'),
('Pertalite'),
('Solar'),
('Dexlite');

-- Insert Roles
INSERT INTO roles (name) VALUES 
('Super Admin'),
('Admin'),
('Operator');

-- Trigger untuk updated_at (opsional, bisa dihandle aplikasi)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spbus_updated_at BEFORE UPDATE ON spbus
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adjustments_updated_at BEFORE UPDATE ON adjustments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE INDEX idx_prices_fuel ON prices(fuel_type_id);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_adjustments_spbu ON adjustments(spbu_id);
CREATE INDEX idx_adjustments_status ON adjustments(status);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
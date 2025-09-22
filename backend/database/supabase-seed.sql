-- Script untuk mengisi data awal (seed) di Supabase

-- Insert SPBU contoh
INSERT INTO spbus (name, location, code, is_active) VALUES 
('SPBU Pusat', 'Jl. Merdeka No. 123, Jakarta', 'SPBU-001', true),
('SPBU Cabang', 'Jl. Sudirman No. 456, Bandung', 'SPBU-002', true);

-- Insert Users contoh (password dalam format hash bcrypt - contoh: 'password123')
-- Super Admin
INSERT INTO users (name, email, password, role_id, spbu_id, is_active) VALUES 
('Super Admin', 'superadmin@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 1, NULL, true);

-- Admin SPBU Pusat
INSERT INTO users (name, email, password, role_id, spbu_id, is_active) VALUES 
('Admin Pusat', 'admin1@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 2, 1, true);

-- Admin SPBU Cabang
INSERT INTO users (name, email, password, role_id, spbu_id, is_active) VALUES 
('Admin Cabang', 'admin2@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 2, 2, true);

-- Operator SPBU Pusat
INSERT INTO users (name, email, password, role_id, spbu_id, is_active) VALUES 
('Operator Pusat 1', 'operator1a@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 3, 1, true),
('Operator Pusat 2', 'operator1b@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 3, 1, true);

-- Operator SPBU Cabang
INSERT INTO users (name, email, password, role_id, spbu_id, is_active) VALUES 
('Operator Cabang 1', 'operator2a@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 3, 2, true),
('Operator Cabang 2', 'operator2b@spbu.com', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW', 3, 2, true);

-- Insert harga bahan bakar contoh
INSERT INTO prices (spbu_id, fuel_type_id, price, updated_by) VALUES 
-- Harga untuk SPBU Pusat
(1, 1, 10000.00, 2), -- Premium
(1, 2, 12000.00, 2), -- Pertamax
(1, 3, 11000.00, 2), -- Pertalite
(1, 4, 7000.00, 2),  -- Solar
(1, 5, 13000.00, 2), -- Dexlite

-- Harga untuk SPBU Cabang
(2, 1, 10100.00, 3), -- Premium
(2, 2, 12100.00, 3), -- Pertamax
(2, 3, 11100.00, 3), -- Pertalite
(2, 4, 7100.00, 3),  -- Solar
(2, 5, 13100.00, 3); -- Dexlite

-- Insert contoh penjualan
INSERT INTO sales (spbu_id, operator_id, pump_number, fuel_type_id, liters, amount) VALUES 
(1, 4, 1, 2, 50.50, 606000.00), -- Pertamax
(1, 4, 2, 3, 40.25, 442750.00), -- Pertalite
(2, 6, 1, 1, 30.00, 300000.00), -- Premium
(2, 6, 2, 4, 60.75, 425250.00); -- Solar

-- Insert contoh pengiriman
INSERT INTO deliveries (spbu_id, supplier, fuel_type_id, liters, status, confirmed_by, approved_by) VALUES 
(1, 'PT. Mitra Energi', 2, 1000.00, 'approved', 2, 2), -- Pertamax
(1, 'PT. Sumber Jaya', 3, 2000.00, 'approved', 2, 2), -- Pertalite
(2, 'CV. Energy Supply', 1, 1500.00, 'approved', 3, 3), -- Premium
(2, 'PT. Solarindo', 4, 3000.00, 'approved', 3, 3); -- Solar

-- Insert contoh deposit
INSERT INTO deposits (spbu_id, operator_id, amount, payment_method, status, approved_by) VALUES 
(1, 4, 5000000.00, 'transfer', 'approved', 2),
(2, 6, 3000000.00, 'cash', 'approved', 3);

-- Insert contoh kehadiran
INSERT INTO attendance (user_id, spbu_id, check_in, check_out, date) VALUES 
(4, 1, '2023-01-01 08:00:00', '2023-01-01 17:00:00', '2023-01-01'),
(5, 1, '2023-01-01 08:15:00', '2023-01-01 17:15:00', '2023-01-01'),
(6, 2, '2023-01-01 07:45:00', '2023-01-01 16:45:00', '2023-01-01'),
(7, 2, '2023-01-01 08:30:00', '2023-01-01 17:30:00', '2023-01-01');

-- Insert contoh penyesuaian
INSERT INTO adjustments (spbu_id, operator_id, type, description, status, approved_by) VALUES 
(1, 4, 'fuel', 'Koreksi stok bensin karena penguapan', 'approved', 2),
(2, 6, 'equipment', 'Kalibrasi pompa bensin', 'approved', 3);

-- Insert contoh log audit
INSERT INTO audit_logs (user_id, action, resource, resource_id, details) VALUES 
(1, 'CREATE', 'user', '4', '{"name": "Operator Pusat 1", "email": "operator1a@spbu.com"}'),
(2, 'UPDATE', 'price', '1', '{"old_price": 9500.00, "new_price": 10000.00}'),
(3, 'DELETE', 'user', '8', '{"name": "Operator Cadangan", "email": "operatorcadangan@spbu.com"}');
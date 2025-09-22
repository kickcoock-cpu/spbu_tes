-- Script untuk membuat database dan user untuk SPBU Management System

-- Membuat database
CREATE DATABASE IF NOT EXISTS spbu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Membuat user (jika belum ada)
CREATE USER IF NOT EXISTS 'spbu_user'@'localhost' IDENTIFIED BY 'spbu_password';

-- Memberikan hak akses ke database
GRANT ALL PRIVILEGES ON spbu_db.* TO 'spbu_user'@'localhost';

-- Menerapkan perubahan hak akses
FLUSH PRIVILEGES;

-- Menggunakan database
USE spbu_db;

-- Menampilkan informasi
SELECT 'Database spbu_db berhasil dibuat' AS message;
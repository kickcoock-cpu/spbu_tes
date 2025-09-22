# Migrasi Database ke Supabase

## Perbedaan Utama antara MySQL dan PostgreSQL

### 1. Tipe Data
| MySQL | PostgreSQL | Keterangan |
|-------|------------|------------|
| INT AUTO_INCREMENT | SERIAL | Auto-increment di PostgreSQL |
| ENUM | Tabel terpisah dengan foreign key | PostgreSQL tidak mendukung ENUM native |
| TIMESTAMP ON UPDATE | Trigger atau handle di aplikasi | PostgreSQL tidak memiliki fitur ini native |

### 2. Syntax
| Fitur | MySQL | PostgreSQL |
|-------|-------|------------|
| Buat Database | CREATE DATABASE IF NOT EXISTS | Tidak perlu, database sudah disediakan |
| Foreign Key | ON DELETE CASCADE | Sama |
| Index | CREATE INDEX | Sama |

## File yang Dibuat

1. `supabase-schema.sql` - Schema database yang disesuaikan untuk PostgreSQL
2. `supabase-seed.sql` - Data awal untuk testing

## Cara Migrasi

### 1. Menggunakan SQL Editor di Supabase Dashboard

1. Masuk ke [supabase.com](https://supabase.com) dan buka project Anda
2. Klik "SQL" di sidebar kiri
3. Klik "New Query"
4. Salin dan tempel isi dari `supabase-schema.sql`
5. Klik "Run" untuk mengeksekusi

### 2. Menggunakan psql (command line)

1. Install PostgreSQL client di komputer Anda
2. Jalankan perintah:
   ```bash
   psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase-schema.sql
   ```

### 3. Menggunakan Supabase CLI

1. Install Supabase CLI
2. Masuk ke direktori project
3. Jalankan:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   supabase db push
   ```

## Perubahan yang Dilakukan

### 1. Tabel ENUM diganti dengan Tabel Terpisah
Daripada menggunakan ENUM, kita membuat tabel terpisah:
```sql
-- Tabel Fuel Types (menggantikan ENUM)
CREATE TABLE fuel_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Dan menggunakan foreign key:
```sql
-- Di tabel sales
fuel_type_id INTEGER NOT NULL REFERENCES fuel_types(id)
```

### 2. AUTO_INCREMENT diganti dengan SERIAL
```sql
-- MySQL
id INT AUTO_INCREMENT PRIMARY KEY

-- PostgreSQL
id SERIAL PRIMARY KEY
```

### 3. Penanganan TIMESTAMP ON UPDATE
MySQL memiliki fitur `ON UPDATE CURRENT_TIMESTAMP` yang tidak ada di PostgreSQL. Kita menggantinya dengan:
- Trigger (opsional)
- Penanganan di aplikasi (lebih umum)

### 4. CURRENT_DATE
```sql
-- MySQL
date DATE DEFAULT (CURRENT_DATE)

-- PostgreSQL
date DATE DEFAULT CURRENT_DATE
```

## Data Awal (Seed)

File `supabase-seed.sql` berisi:
1. Contoh data SPBU
2. Contoh pengguna dengan role berbeda
3. Contoh harga bahan bakar
4. Contoh transaksi penjualan
5. Contoh pengiriman
6. Cont.oh deposit
7. Contoh kehadiran
8. Contoh penyesuaian
9. Contoh log audit

## Password Pengguna

Password untuk semua pengguna dalam seed adalah `password123` dalam format hash bcrypt:
```
$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4qC9Ia4L6rWuI4rC7yW
```

## Verifikasi Migrasi

Setelah menjalankan script migrasi:

1. **Cek tabel**:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. **Cek data awal**:
   ```sql
   SELECT COUNT(*) FROM roles;
   SELECT COUNT(*) FROM spbus;
   SELECT COUNT(*) FROM users;
   ```

3. **Cek foreign key**:
   ```sql
   SELECT conname, conrelid::regclass, confrelid::regclass
   FROM pg_constraint
   WHERE contype = 'f';
   ```

## Troubleshooting

### Masalah Umum

1. **Error foreign key**:
   - Pastikan tabel referensi dibuat sebelum tabel yang merujuk
   - Periksa tipe data yang sesuai

2. **Error tipe data**:
   - `INT` → `INTEGER`
   - `VARCHAR` tetap sama
   - `TEXT` tetap sama
   - `DECIMAL` tetap sama
   - `BOOLEAN` tetap sama

3. **Error syntax**:
   - Hilangkan `IF NOT EXISTS` pada CREATE DATABASE
   - Hilangkan `ON UPDATE CURRENT_TIMESTAMP`

### Jika Terjadi Error

1. **Drop semua tabel**:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

2. **Jalankan ulang migrasi**

3. **Periksa log error untuk detail spesifik**

## Best Practices

1. **Gunakan transaction** untuk migrasi kompleks:
   ```sql
   BEGIN;
   -- Perintah SQL
   COMMIT;
   ```

2. **Backup data** sebelum migrasi

3. **Test di environment staging** sebelum production

4. **Gunakan tools migrasi** seperti Sequelize untuk migrasi terstruktur
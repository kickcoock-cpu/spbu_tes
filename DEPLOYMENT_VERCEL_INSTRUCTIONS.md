# Deployment ke Vercel

## Persiapan

Sebelum deployment, pastikan Anda memiliki:

1. Akun Vercel ([https://vercel.com](https://vercel.com))
2. Database (bisa menggunakan MySQL atau Supabase)
3. Repository ini sudah diupload ke GitHub/GitLab/Bitbucket

## Langkah-langkah Deployment

### 1. Deploy Backend

1. Masuk ke dashboard Vercel
2. Klik "New Project"
3. Pilih repository ini
4. Pada konfigurasi:
   - Atur "Root Directory" ke `backend`
   - Biarkan "Framework Preset" pada "Other"
   - Build Command: biarkan default
   - Output Directory: biarkan default
5. Tambahkan Environment Variables (lihat bagian Database Configuration di bawah)
6. Deploy dan catat URL backend (misal: `https://your-project-backend.vercel.app`)

### 2. Deploy Frontend

1. Kembali ke dashboard Vercel
2. Klik "New Project"
3. Pilih repository ini lagi
4. Pada konfigurasi:
   - Atur "Root Directory" ke `frontend`
   - Pilih "Framework Preset" sebagai "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Tambahkan Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app  # URL dari backend yang sudah dideploy
   ```
6. Deploy frontend

## Konfigurasi Database

### Opsi 1: Supabase (Direkomendasikan)

Supabase menyediakan database PostgreSQL yang gratis dan mudah digunakan.

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Dapatkan kredensial koneksi:
   - Host
   - Port (5432)
   - Database name (postgres)
   - Username (postgres)
   - Password
4. Gunakan kredensial ini untuk environment variables di Vercel:
   ```
   DB_DIALECT=postgres
   DB_HOST=your_supabase_host.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   JWT_SECRET=your_jwt_secret_key  # Minimal 32 karakter untuk keamanan
   ```

### Opsi 2: Planetscale (MySQL)

1. Buat akun di [planetscale.com](https://planetscale.com)
2. Buat database baru
3. Dapatkan kredensial koneksi:
   - Host
   - Username
   - Password
   - Database name
4. Gunakan kredensial ini untuk environment variables di Vercel:
   ```
   DB_HOST=us-east.connect.psdb.cloud  # Atau region yang sesuai
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

### Opsi 3: Database Cloud Lainnya

Layanan lain seperti:
- AWS RDS
- Google Cloud SQL
- Azure Database for MySQL

## Setup Database Schema

Setelah membuat database, jalankan schema.sql untuk membuat struktur tabel:

```bash
# Untuk MySQL
mysql -h DB_HOST -u DB_USER -p DB_NAME < database/schema.sql

# Untuk PostgreSQL (Supabase)
psql -h DB_HOST -U DB_USER -d DB_NAME -f database/schema.sql
```

Atau gunakan interface database management tool seperti:
- phpMyAdmin (untuk MySQL)
- MySQL Workbench (untuk MySQL)
- DBeaver (untuk kedua jenis database)
- Supabase SQL Editor (untuk Supabase)

## Environment Variables yang Diperlukan

Di Vercel, atur environment variables berikut untuk backend:

### Untuk Supabase:
```
DB_DIALECT=postgres
DB_HOST=your_supabase_host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=your_jwt_secret_key  # Minimal 32 karakter untuk keamanan
PORT=3000
```

### Untuk MySQL:
```
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_key  # Minimal 32 karakter untuk keamanan
PORT=3000
```

## Catatan Penting

1. Pastikan backend dideploy terlebih dahulu untuk mendapatkan URL API
2. Sesuaikan `VITE_API_URL` di frontend dengan URL backend yang sudah dideploy
3. Untuk database, pastikan koneksi bisa diakses dari Vercel (biasanya perlu whitelist IP atau menggunakan database cloud)
4. Jika menggunakan database lokal, Anda perlu menghosting database tersebut agar bisa diakses dari internet
5. Socket.IO mungkin tidak berfungsi penuh di Vercel karena keterbatasan serverless environment. Untuk fitur real-time penuh, pertimbangkan menggunakan server dedicated.

## Troubleshooting

Jika mengalami masalah:

1. **CORS Error**: Pastikan CORS di backend mengizinkan origin dari frontend
2. **Database Connection**: Periksa kembali environment variables untuk database
3. **Environment Variables**: Pastikan semua variable sudah diatur dengan benar di Vercel dashboard
4. **Build Error**: Periksa logs di Vercel dashboard untuk informasi lebih detail
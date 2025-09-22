# Konfigurasi Database untuk Vercel

## Opsi 1: Planetscale (Direkomendasikan)

Planetscale menyediakan database MySQL yang gratis dan kompatibel dengan Vercel.

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

## Opsi 2: Railway

1. Buat akun di [railway.app](https://railway.app)
2. Buat database MySQL baru
3. Dapatkan kredensial koneksi dari dashboard Railway
4. Gunakan kredensial ini untuk environment variables di Vercel

## Opsi 3: Database Cloud Lainnya

Layanan lain seperti:
- AWS RDS
- Google Cloud SQL
- Azure Database for MySQL

## Setup Database Schema

Setelah membuat database, jalankan schema.sql untuk membuat struktur tabel:

```bash
mysql -h DB_HOST -u DB_USER -p DB_NAME < database/schema.sql
```

Atau gunakan interface database management tool seperti:
- phpMyAdmin
- MySQL Workbench
- DBeaver

## Environment Variables yang Diperlukan

Di Vercel, atur environment variables berikut untuk backend:

```
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_key  # Minimal 32 karakter untuk keamanan
```

## Catatan Keamanan

1. Jangan pernah menyimpan kredensial database dalam kode sumber
2. Gunakan environment variables untuk semua informasi sensitif
3. Rotasi password secara berkala
4. Gunakan koneksi SSL jika tersedia
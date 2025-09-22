# Penggunaan Supabase untuk Database

## Membuat Project di Supabase

1. Masuk ke [supabase.com](https://supabase.com) dan buat akun jika belum punya
2. Klik "New Project"
3. Isi detail project:
   - Name: Nama project Anda
   - Database Password: Password untuk database (simpan dengan aman)
   - Region: Pilih region terdekat dengan pengguna Anda
4. Klik "Create new project"

## Mendapatkan Kredensial Database

Setelah project dibuat, Anda bisa mendapatkan kredensial database:

1. Masuk ke dashboard project Anda
2. Klik "Settings" di sidebar kiri
3. Pilih "Database" di menu settings
4. Di bagian "Connection Info", Anda akan menemukan:
   - Host
   - Port (5432)
   - Database name (postgres)
   - User (postgres)
   - Password (yang Anda buat saat membuat project)

## Environment Variables untuk Supabase

Gunakan environment variables berikut di Vercel:

```
DB_DIALECT=postgres
DB_HOST=your_supabase_db_host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_db_password
JWT_SECRET=your_jwt_secret_key_here_min_32_characters
PORT=3000
```

## Catatan Penting untuk Supabase

1. **SSL Connection**: Koneksi ke Supabase menggunakan SSL secara default
2. **Port**: Gunakan port 5432 untuk PostgreSQL
3. **Dialect**: Pastikan `DB_DIALECT` diatur ke `postgres`
4. **Schema**: Supabase menggunakan schema `public` secara default

## Migrasi Database Schema

Untuk membuat struktur database di Supabase:

1. Masuk ke Supabase Dashboard
2. Buka "SQL Editor" di menu kiri
3. Salin dan jalankan isi dari `database/schema.sql`
4. Atau gunakan "Table Editor" untuk membuat tabel secara manual

## Troubleshooting

Jika mengalami masalah koneksi:

1. **Connection Refused**: Pastikan kredensial benar dan project sudah aktif
2. **SSL Error**: Pastikan `dialectOptions` di konfigurasi database sudah benar
3. **Authentication Failed**: Periksa kembali username dan password
4. **Network Error**: Pastikan tidak ada firewall yang memblokir koneksi

## Keuntungan Menggunakan Supabase

1. **Gratis**: Supabase menyediakan tier gratis yang cukup untuk pengembangan
2. **Realtime**: Mendukung fitur realtime dengan Socket.IO
3. **Scalable**: Mudah di-scale saat aplikasi berkembang
4. **Managed**: Tidak perlu mengelola server database
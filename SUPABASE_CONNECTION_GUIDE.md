# Panduan Koneksi ke Supabase

## Persiapan Supabase

### 1. Membuat Akun Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "Start your project" atau "Sign up"
3. Buat akun dengan email dan password Anda

### 2. Membuat Project Baru
1. Setelah login, klik "New Project"
2. Isi detail project:
   - **Name**: Beri nama project Anda (misal: spbu-management)
   - **Database Password**: Buat password yang kuat untuk database
   - **Region**: Pilih region terdekat dengan pengguna Anda
3. Klik "Create new project"
4. Tunggu sampai project selesai dibuat (bisa memakan waktu beberapa menit)

### 3. Mendapatkan Kredensial Database
1. Setelah project aktif, klik "Settings" di sidebar kiri
2. Pilih "Database" di menu settings
3. Di bagian "Connection Info", catat informasi berikut:
   - **Host**: URL host database (berbentuk `project-id.supabase.co`)
   - **Port**: 5432 (default untuk PostgreSQL)
   - **Database**: postgres (default)
   - **User**: postgres (default)
   - **Password**: Password yang Anda buat saat membuat project

## Konfigurasi Environment Variables

### Di Vercel:
Set environment variables berikut di Vercel Dashboard:

```
DB_DIALECT=postgres
DB_HOST=your_supabase_project_id.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=your_jwt_secret_key_min_32_characters_here
PORT=3000
NODE_ENV=production
```

### Di Local Development:
1. Salin file `.env.supabase` ke `.env`:
   ```bash
   cp .env.supabase .env
   ```
2. Edit file `.env` dan isi dengan kredensial Supabase Anda

## Menguji Koneksi Database

### Menjalankan Test Koneksi
```bash
# Di direktori backend
npm run test-supabase
```

Atau langsung menjalankan script:
```bash
# Di direktori backend
node test-supabase-connection.js
```

### Hasil Test yang Diharapkan
- ✅ Jika berhasil: "Koneksi ke Supabase berhasil!"
- ❌ Jika gagal: Pesan error dengan informasi troubleshooting

## Setup Schema Database

### Menggunakan SQL Editor Supabase
1. Di dashboard Supabase, klik "SQL" di sidebar kiri
2. Klik "New Query"
3. Salin dan tempel isi dari `database/schema.sql`
4. Klik "Run" untuk mengeksekusi query

Catatan: Anda mungkin perlu menyesuaikan sedikit syntax karena schema.sql ditulis untuk MySQL. Beberapa perubahan yang mungkin diperlukan:
- Mengganti `AUTO_INCREMENT` dengan `SERIAL`
- Mengganti `ENUM` dengan `TEXT` atau membuat custom types
- Mengganti `JSON` dengan `JSONB`

## Troubleshooting

### Masalah Koneksi Umum
1. **"Connection refused"**: Periksa kredensial dan pastikan project aktif
2. **"Authentication failed"**: Periksa username dan password
3. **"SSL connection error"**: Konfigurasi SSL sudah diatur secara otomatis
4. **"Host not found"**: Periksa apakah host URL sudah benar

### Masalah Environment Variables
1. Pastikan semua environment variables sudah diatur
2. Periksa apakah tidak ada spasi tambahan di nilai variables
3. Pastikan tidak ada karakter spesial yang tidak di-escape

### Masalah Dependensi
1. Pastikan paket `pg` sudah terinstal:
   ```bash
   npm install pg
   ```
2. Pastikan `package.json` memiliki dependensi yang benar

## Best Practices

1. **Jangan hardcode kredensial** - Gunakan selalu environment variables
2. **Gunakan password yang kuat** untuk database Supabase
3. **Backup data secara berkala**
4. **Monitor penggunaan resource** di dashboard Supabase
5. **Gunakan connection pooling** untuk aplikasi dengan banyak pengguna
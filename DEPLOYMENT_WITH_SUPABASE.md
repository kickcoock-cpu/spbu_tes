# Deployment ke Vercel dengan Supabase

## Keuntungan Menggunakan Supabase

1. **Gratis**: Supabase menyediakan tier gratis yang cukup untuk pengembangan
2. **Realtime**: Mendukung fitur realtime dengan Socket.IO
3. **Scalable**: Mudah di-scale saat aplikasi berkembang
4. **Managed**: Tidak perlu mengelola server database
5. **PostgreSQL**: Database yang powerful dan reliable

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
   - **Host**: URL host database
   - **Port**: 5432 (default untuk PostgreSQL)
   - **Database**: postgres (default)
   - **User**: postgres (default)
   - **Password**: Password yang Anda buat saat membuat project

## Setup Database Schema

### Menggunakan SQL Editor Supabase

1. Di dashboard Supabase, klik "SQL" di sidebar kiri
2. Klik "New Query"
3. Salin dan tempel isi dari `backend/database/schema.sql`
4. Klik "Run" untuk mengeksekusi query

Catatan: Anda mungkin perlu menyesuaikan sedikit syntax karena schema.sql ditulis untuk MySQL. Beberapa perubahan yang mungkin diperlukan:
- Mengganti `AUTO_INCREMENT` dengan `SERIAL`
- Mengganti `ENUM` dengan `TEXT` atau membuat custom types
- Mengganti `JSON` dengan `JSONB`

### Alternatif: Menggunakan Table Editor

1. Di dashboard Supabase, klik "Table Editor" di sidebar kiri
2. Buat tabel satu per satu sesuai dengan schema.sql
3. Tambahkan kolom, tipe data, dan constraints sesuai kebutuhan

## Konfigurasi Environment Variables di Vercel

Setelah mendapatkan kredensial database dari Supabase, atur environment variables berikut di Vercel:

### Untuk Backend:
```
DB_DIALECT=postgres
DB_HOST=your_supabase_host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=your_jwt_secret_key_min_32_characters
PORT=3000
```

### Untuk Frontend:
```
VITE_API_URL=https://your-backend-url.vercel.app
```

## Deployment ke Vercel

### 1. Deploy Backend

1. Masuk ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Pilih repository yang berisi kode ini
4. Pada konfigurasi project:
   - Atur "Root Directory" ke `backend`
   - Framework Preset pilih "Other"
   - Build Command: biarkan default
   - Output Directory: biarkan default
5. Pada tab "Environment Variables", tambahkan semua variables yang telah disebutkan di atas
6. Klik "Deploy"
7. Tunggu sampai deployment selesai dan catat URL backend

### 2. Deploy Frontend

1. Kembali ke Vercel Dashboard
2. Klik "New Project"
3. Pilih repository yang sama
4. Pada konfigurasi project:
   - Atur "Root Directory" ke `frontend`
   - Framework Preset pilih "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Tambahkan environment variable:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
   (Ganti dengan URL backend yang telah dideploy)
6. Klik "Deploy"

## Migrasi Data (Jika Diperlukan)

Jika Anda memiliki data yang sudah ada dan perlu dimigrasi:

1. Ekspor data dari database lama
2. Konversi format data ke format yang kompatibel dengan PostgreSQL
3. Impor data ke Supabase menggunakan:
   - Supabase SQL Editor
   - `psql` command line tool
   - Tools migrasi database pihak ketiga

## Monitoring dan Maintenance

### Monitoring di Supabase

1. Di dashboard Supabase, gunakan tab "Database" untuk memonitor:
   - Connection usage
   - Storage usage
   - Performance metrics

### Monitoring di Vercel

1. Di dashboard Vercel, monitor:
   - Serverless function execution
   - Response times
   - Error rates

## Troubleshooting

### Masalah Koneksi Database

Jika mengalami masalah koneksi ke Supabase:

1. **Periksa kredensial**: Pastikan semua environment variables sudah benar
2. **Periksa status project**: Pastikan project Supabase sudah aktif
3. **Periksa firewall**: Supabase seharusnya tidak memerlukan whitelist IP
4. **Periksa SSL**: Konfigurasi SSL sudah diset secara otomatis

### Masalah Deployment

Jika deployment gagal:

1. **Periksa logs**: Lihat detail error di Vercel dashboard
2. **Periksa environment variables**: Pastikan semua variables sudah diatur
3. **Periksa koneksi database**: Test koneksi dari lokal jika perlu

### Masalah Schema Database

Jika ada masalah dengan schema database:

1. **Periksa tipe data**: Beberapa tipe data MySQL mungkin perlu disesuaikan untuk PostgreSQL
2. **Periksa constraints**: Beberapa constraint mungkin perlu disesuaikan
3. **Periksa indexes**: Format index mungkin berbeda

## Upgrade ke Plan Berbayar

Jika aplikasi Anda mulai digunakan secara produksi:

1. Di dashboard Supabase, klik "Billing"
2. Pilih plan yang sesuai dengan kebutuhan Anda
3. Upgrade sesuai kebutuhan:
   - Lebih banyak storage
   - Lebih banyak connections
   - Fitur tambahan seperti authentication dan storage

## Best Practices

1. **Gunakan environment variables**: Jangan hardcode kredensial
2. **Backup data**: Lakukan backup berkala database
3. **Monitor usage**: Pantau penggunaan resource untuk menghindari overlimit
4. **Secure JWT secret**: Gunakan secret key yang kuat dan rahasiakan
5. **Update dependencies**: Perbarui dependencies secara berkala untuk keamanan
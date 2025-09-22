# Ringkasan Koneksi ke Supabase

## File yang Telah Dibuat

1. `backend/config/supabase-db.js` - Konfigurasi koneksi database khusus untuk Supabase
2. `backend/.env.supabase` - Template environment variables untuk Supabase
3. `backend/test-supabase-connection.js` - Script untuk mengetes koneksi ke Supabase
4. `backend/supabase-entry.js` - Entry point khusus untuk Supabase dan Vercel
5. `backend/vercel.supabase.json` - Konfigurasi Vercel khusus untuk Supabase
6. `SUPABASE_CONNECTION_GUIDE.md` - Panduan lengkap koneksi ke Supabase

## Perubahan pada File yang Sudah Ada

1. `backend/package.json` - Menambahkan script `test-supabase`
2. `backend/vercel.json` - Memperbarui konfigurasi dengan environment variable default

## Cara Menggunakan

### 1. Persiapan
1. Buat project di Supabase
2. Dapatkan kredensial database dari dashboard Supabase
3. Atur environment variables di Vercel atau file `.env` lokal

### 2. Test Koneksi
```bash
# Di direktori backend
npm run test-supabase
```

### 3. Deploy ke Vercel
1. Gunakan `vercel.supabase.json` sebagai konfigurasi
2. Atur semua environment variables yang diperlukan di Vercel Dashboard

## Environment Variables yang Diperlukan

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

## Fitur Khusus

1. **Koneksi SSL** - Secara otomatis mengaktifkan koneksi SSL untuk Supabase
2. **Penanganan Error** - Memberikan informasi error yang lebih detail
3. **Test Koneksi** - Script khusus untuk mengetes koneksi database
4. **Entry Point Terpisah** - Entry point khusus untuk Supabase dan Vercel

## Troubleshooting

Jika mengalami masalah:
1. Pastikan semua environment variables sudah diatur dengan benar
2. Jalankan `npm run test-supabase` untuk mengetes koneksi
3. Periksa logs di Vercel Dashboard untuk informasi error lebih detail
4. Pastikan project Supabase sudah aktif dan dapat diakses

## Catatan Penting

1. Jangan pernah commit file `.env` ke repository
2. Gunakan password yang kuat untuk database Supabase
3. Pastikan dependensi `pg` sudah terinstal
4. Untuk schema database, mungkin perlu penyesuaian untuk kompatibilitas PostgreSQL
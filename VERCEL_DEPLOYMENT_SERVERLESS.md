# Deployment ke Vercel - Serverless Function

## Perubahan Terbaru

Kami telah membuat entry point khusus untuk lingkungan serverless Vercel untuk mengatasi masalah crash pada Serverless Function.

## File Baru

1. `vercel-entry.js` - Entry point khusus untuk Vercel Serverless Functions
2. `vercel.json` - Konfigurasi Vercel yang menggunakan entry point baru
3. `.env.vercel` - Contoh environment variables untuk Vercel

## Perbedaan dengan Entry Point Sebelumnya

### vercel-entry.js
- Menggunakan pendekatan handler khusus untuk Vercel
- Menangani preflight requests CORS secara eksplisit
- Memisahkan inisialisasi aplikasi dari penanganan request
- Menambahkan penanganan error yang lebih baik
- Mengatur limit ukuran payload yang lebih tinggi

## Konfigurasi Vercel

File `vercel.json` sekarang menggunakan:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "vercel-entry.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "vercel-entry.js"
    }
  ]
}
```

## Cara Deploy

1. Pastikan semua environment variables diatur di Vercel Dashboard:
   ```
   DB_DIALECT=postgres
   DB_HOST=your_supabase_host.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   JWT_SECRET=your_jwt_secret_key_min_32_characters_here
   PORT=3000
   SYNC_DATABASE=false
   ```

2. Deploy ke Vercel seperti biasa

## Troubleshooting

### Jika Masih Crash
1. Periksa logs di Vercel Dashboard untuk error spesifik
2. Pastikan environment variables sudah diatur dengan benar
3. Periksa koneksi database - pastikan Supabase dapat diakses dari Vercel
4. Periksa apakah ada error saat inisialisasi aplikasi

### Error Koneksi Database
Jika ada error koneksi database:
1. Pastikan kredensial Supabase sudah benar
2. Pastikan project Supabase sudah aktif
3. Periksa apakah ada whitelist IP yang diperlukan

### Error Module
Jika ada error module tidak ditemukan:
1. Pastikan semua dependensi ada di package.json
2. Periksa apakah ada dependensi yang perlu diinstall secara eksplisit

## Catatan Penting

1. Entry point baru tidak menggunakan Socket.IO karena keterbatasan lingkungan serverless
2. Untuk fitur real-time, pertimbangkan menggunakan server dedicated atau layanan seperti Supabase Realtime
3. File ini dioptimalkan untuk lingkungan serverless Vercel
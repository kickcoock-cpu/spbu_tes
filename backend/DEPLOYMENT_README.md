# SPBU Management System - Backend Deployment

## File Konfigurasi untuk Vercel

File-file berikut telah dibuat untuk memastikan backend dapat dideploy dengan baik ke Vercel:

### 1. `vercel.json`
File konfigurasi utama untuk deployment ke Vercel. Mengatur:
- Build configuration
- Routes
- Entry point (`api.js`)

### 2. `api.js`
Entry point khusus untuk Vercel serverless environment. File ini:
- Mengimpor aplikasi Express dari `server.js`
- Menangani permintaan HTTP
- Kompatibel dengan Vercel serverless functions

### 3. `server.js`
Konfigurasi server Express yang terpisah untuk memudahkan pengelolaan.

### 4. `socket.js`
Konfigurasi Socket.IO yang terpisah.

## Environment Variables yang Diperlukan

Pastikan environment variables berikut diatur di Vercel dashboard:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

## Catatan Khusus untuk Vercel

1. **Serverless Environment**: Vercel menggunakan serverless functions yang memiliki keterbatasan:
   - Tidak ada state yang persisten antar requests
   - Waktu eksekusi terbatas
   - Socket.IO mungkin tidak berfungsi penuh

2. **Database Connection**: Koneksi database akan dibuat ulang untuk setiap request.

3. **File System**: Tidak ada akses file system yang persisten.

## Deployment Process

1. Di Vercel dashboard, pilih repository ini
2. Set "Root Directory" ke `backend`
3. Framework Preset: "Other"
4. Tambahkan environment variables
5. Deploy

## Troubleshooting

Jika mengalami masalah:

1. **500 Errors**: Periksa logs di Vercel dashboard
2. **Database Connection**: Pastikan kredensial database benar
3. **CORS Issues**: Periksa konfigurasi CORS di `server.js`
4. **Environment Variables**: Pastikan semua variables diatur di Vercel dashboard

## File Dokumentasi Tambahan

Lihat file-file berikut untuk informasi lebih detail:
- `../DEPLOYMENT_VERCEL_INSTRUCTIONS.md`
- `../DATABASE_VERCEL_SETUP.md`
- `../ENVIRONMENT_VARIABLES_EXAMPLE.md`
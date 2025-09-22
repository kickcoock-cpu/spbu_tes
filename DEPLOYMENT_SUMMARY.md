# Panduan Deployment ke Vercel - SPBU Management System

## Struktur Proyek

Proyek ini terdiri dari dua bagian utama:
1. **Backend** (Node.js + Express + MySQL) - Direktori `backend`
2. **Frontend** (React + Vite + Tailwind CSS) - Direktori `frontend`

Kedua bagian ini akan dideploy secara terpisah ke Vercel.

## File Konfigurasi yang Telah Dibuat

### Backend (`backend/`):
- `vercel.json` - Konfigurasi deployment untuk Vercel
- `api.js` - Entry point untuk Vercel serverless
- `server.js` - Server configuration
- `socket.js` - Socket.IO configuration

### Frontend (`frontend/`):
- `vercel.json` - Konfigurasi deployment untuk Vercel

### Root:
- `DEPLOYMENT_VERCEL.md` - Dokumentasi deployment
- `DEPLOYMENT_VERCEL_INSTRUCTIONS.md` - Instruksi detail deployment
- `DATABASE_VERCEL_SETUP.md` - Panduan setup database
- `ENVIRONMENT_VARIABLES_EXAMPLE.md` - Contoh environment variables

## Langkah Deployment

### 1. Persiapan Database

Sebelum deployment, Anda perlu database MySQL. Opsi yang direkomendasikan:
1. **Planetscale** (Gratis, mudah, kompatibel dengan Vercel)
2. **Railway** (Mudah digunakan)
3. Layanan database cloud lainnya

### 2. Deploy Backend

1. Masuk ke [vercel.com](https://vercel.com)
2. Buat project baru
3. Pilih repository ini
4. Atur konfigurasi:
   - Root Directory: `backend`
   - Framework Preset: Other
5. Tambahkan Environment Variables:
   ```
   PORT=3000
   JWT_SECRET=your_secret_key_here
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```
6. Deploy dan catat URL-nya

### 3. Deploy Frontend

1. Buat project baru di Vercel
2. Pilih repository ini
3. Atur konfigurasi:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Tambahkan Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
5. Deploy

## Catatan Penting

1. **Urutan Deployment**: Deploy backend terlebih dahulu untuk mendapatkan URL API
2. **Environment Variables**: Pastikan semua variable diatur dengan benar
3. **Database Connection**: Pastikan database bisa diakses dari Vercel
4. **Socket.IO Limitations**: Fitur real-time mungkin terbatas di environment serverless Vercel

## Troubleshooting

Jika mengalami masalah:
1. Periksa logs di Vercel dashboard
2. Pastikan semua environment variables sudah benar
3. Periksa koneksi database
4. Pastikan CORS diatur dengan benar
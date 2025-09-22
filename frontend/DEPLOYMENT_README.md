# SPBU Management System - Deployment ke Vercel

## Tentang Proyek

Sistem ini adalah aplikasi manajemen SPBU yang dilengkapi dengan sidebar dinamis yang dapat menyesuaikan menu berdasarkan role pengguna (Super Admin, Admin, Operator). Sistem ini juga menyediakan fitur CRUD otomatis untuk setiap menu yang tersedia.

## Teknologi yang Digunakan

### Backend
- Node.js
- Express.js
- MySQL
- Sequelize ORM
- Socket.IO (untuk fitur real-time)

### Frontend
- React 18
- Vite
- Tailwind CSS
- TanStack Router
- TanStack Query

## Struktur Direktori

```
.
├── backend/          # Backend API (Express.js)
└── frontend/         # Frontend Application (React + Vite)
```

## Prasyarat Deployment

1. Akun Vercel ([https://vercel.com](https://vercel.com))
2. Database MySQL (disarankan Planetscale atau Railway)
3. Repository ini di GitHub/GitLab/Bitbucket

## Langkah Deployment

### 1. Setup Database

Sebelum deployment, buat database MySQL di layanan cloud seperti:
- Planetscale (direkomendasikan)
- Railway
- AWS RDS
- Google Cloud SQL

### 2. Deploy Backend

1. Masuk ke dashboard Vercel
2. Klik "New Project"
3. Pilih repository ini
4. Atur konfigurasi:
   - Root Directory: `backend`
   - Framework Preset: Other
   - Build Command: (biarkan default)
   - Output Directory: (biarkan default)
5. Tambahkan Environment Variables:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```
6. Deploy dan catat URL backend

### 3. Deploy Frontend

1. Kembali ke dashboard Vercel
2. Klik "New Project"
3. Pilih repository ini
4. Atur konfigurasi:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Tambahkan Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
6. Deploy

## File Konfigurasi

File-file konfigurasi berikut telah dibuat untuk memudahkan deployment:

### Backend
- `vercel.json` - Konfigurasi Vercel
- `api.js` - Entry point untuk Vercel serverless

### Frontend
- `vercel.json` - Konfigurasi Vercel

## Dokumentasi Tambahan

Lihat file-file berikut untuk informasi lebih detail:
- `DEPLOYMENT_VERCEL_INSTRUCTIONS.md` - Instruksi deployment detail
- `DATABASE_VERCEL_SETUP.md` - Panduan setup database
- `ENVIRONMENT_VARIABLES_EXAMPLE.md` - Contoh environment variables
- `DEPLOYMENT_SUMMARY.md` - Ringkasan deployment

## Catatan Penting

1. **Urutan Deployment**: Deploy backend terlebih dahulu untuk mendapatkan URL API
2. **Environment Variables**: Pastikan semua variable diatur dengan benar di Vercel dashboard
3. **Socket.IO Limitations**: Fitur real-time mungkin terbatas di environment serverless Vercel
4. **Database Connection**: Pastikan database bisa diakses dari Vercel (whitelist IP jika perlu)

## Troubleshooting

Jika mengalami masalah:
1. Periksa logs di Vercel dashboard
2. Pastikan semua environment variables sudah benar
3. Periksa koneksi database
4. Pastikan CORS diatur dengan benar di backend

## Bantuan

Jika memerlukan bantuan tambahan, lihat dokumentasi di folder ini atau hubungi tim pengembang.
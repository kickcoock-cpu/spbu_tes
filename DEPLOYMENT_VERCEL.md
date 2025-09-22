# Deployment ke Vercel

## Struktur Proyek untuk Vercel

Proyek ini terdiri dari dua bagian:
1. **Frontend**: React dengan Vite (di direktori `frontend`)
2. **Backend**: Express.js dengan MySQL (di direktori `backend`)

Kedua bagian ini akan dideploy secara terpisah ke Vercel.

## Langkah-langkah Deployment

### 1. Deploy Backend terlebih dahulu

1. Masuk ke [vercel.com](https://vercel.com) dan buat akun jika belum punya
2. Klik "New Project"
3. Pilih repository yang berisi kode ini
4. Pada konfigurasi project:
   - Atur "Root Directory" ke `backend`
   - Framework Preset pilih "Other"
   - Build Command: `npm run build` (jika ada) atau biarkan default
   - Output Directory: biarkan default

5. Tambahkan Environment Variables untuk backend:
   ```
   PORT=3000
   JWT_SECRET=spbu_jwt_secret_key
   DB_HOST=your_mysql_host
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```

6. Deploy backend dan catat URL yang diberikan (contoh: `https://your-project-backend.vercel.app`)

### 2. Deploy Frontend

1. Kembali ke Vercel Dashboard
2. Klik "New Project"
3. Pilih repository yang sama
4. Pada konfigurasi project:
   - Atur "Root Directory" ke `frontend`
   - Framework Preset pilih "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Tambahkan Environment Variables untuk frontend:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

6. Deploy frontend

## Konfigurasi Database

Untuk backend, Anda memerlukan database MySQL. Anda bisa menggunakan:
- Planetscale
- Railway
- Upstash
- Atau layanan MySQL hosting lainnya

Setelah membuat database, pastikan untuk mengatur environment variables di Vercel sesuai dengan kredensial database Anda.

## Catatan Penting

1. Pastikan backend dideploy terlebih dahulu untuk mendapatkan URL API
2. Sesuaikan `VITE_API_URL` di frontend dengan URL backend yang sudah dideploy
3. Untuk database, pastikan koneksi bisa diakses dari Vercel (biasanya perlu whitelist IP atau menggunakan database cloud)
4. Jika menggunakan database lokal, Anda perlu menghosting database tersebut agar bisa diakses dari internet
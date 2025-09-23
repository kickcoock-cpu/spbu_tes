# DEPLOYMENT CHECKLIST

## ✅ File dan Konfigurasi
- [x] vercel.json - Konfigurasi build dan routes
- [x] package.json - Dependensi dan scripts
- [x] vercel-entry.js - Entry point untuk Vercel
- [x] server.js - Entry point untuk development
- [x] .env.vercel - Environment variables untuk Vercel
- [x] config/db.js - Konfigurasi database
- [x] models/ - Model database
- [x] routes/ - Route API
- [x] controllers/ - Controller API
- [x] middleware/ - Middleware (auth, rbac)

## ✅ Perbaikan CORS
- [x] Menambahkan 'https://simontok-api.vercel.app' ke daftar allowedOrigins
- [x] Memperbaiki handler CORS untuk Vercel (CommonJS dan ES6 modules)
- [x] Memastikan penanganan preflight OPTIONS request

## ✅ Database Connection
- [x] Verifikasi koneksi ke Supabase/PostgreSQL
- [x] Memastikan SSL configuration benar (rejectUnauthorized: false)
- [x] Memastikan environment variables sudah benar

## ✅ Security
- [x] Memastikan JWT_SECRET aman
- [x] Memastikan tidak ada credential sensitif yang terekspos

## ✅ Testing
- [x] Menjalankan test lokal jika diperlukan
- [x] Memastikan semua route berfungsi
- [x] Memastikan middleware auth berfungsi
- [x] Memastikan tidak ada error syntax

## ✅ Deployment
- [ ] Commit dan push perubahan ke repository
- [ ] Deploy ke Vercel melalui dashboard atau CLI
- [ ] Monitor deployment logs
- [ ] Test endpoint setelah deployment

## ✅ Post-Deployment
- [ ] Test login endpoint
- [ ] Test CORS dengan origin yang diizinkan
- [ ] Test endpoint lainnya
- [ ] Monitor error logs
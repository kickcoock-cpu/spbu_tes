# Memperbaiki Masalah Dependensi di Vercel

## Masalah
```
Error: Please install mysql2 package manually
```

Error ini menunjukkan bahwa paket `mysql2` tidak ditemukan saat aplikasi dijalankan di Vercel, meskipun sudah ada di package.json.

## Penyebab Umum

1. **Instalasi dependensi yang tidak lengkap** di lingkungan Vercel
2. **Konfigurasi `vercel.json` yang tidak mencakup semua file** yang diperlukan
3. **Masalah dengan caching** di lingkungan build Vercel
4. **Konflik versi** antara dependensi

## Solusi yang Telah Diterapkan

### 1. Memperbarui package.json
- Menambahkan script `vercel-build` untuk memastikan instalasi dependensi
- Memastikan semua dependensi ada dalam bagian `dependencies` (bukan `devDependencies`)

### 2. Memperbarui vercel.json
- Menambahkan konfigurasi `includeFiles` untuk memastikan semua file penting disertakan
- Memastikan entry point yang benar digunakan

### 3. Memperbarui Konfigurasi Database
- Menambahkan pengecekan ketersediaan driver database sebelum koneksi
- Menambahkan penanganan error yang lebih baik untuk masalah dependensi

## File yang Diperbarui

1. `backend/package.json` - Dengan script `vercel-build` dan verifikasi dependensi
2. `backend/vercel.json` - Dengan konfigurasi `includeFiles`
3. `backend/config/db.js` - Dengan pengecekan driver dan penanganan error

## Cara Deploy yang Direkomendasikan

1. **Clear Cache** di Vercel:
   - Di Vercel Dashboard, pilih project
   - Klik "Settings" → "General"
   - Scroll ke "Build & Development Settings"
   - Klik "Clear Cache and Redeploy"

2. **Deploy dengan Konfigurasi Baru**:
   - Gunakan `package.json` dan `vercel.json` yang telah diperbarui

## Troubleshooting Tambahan

### Jika Masalah Masih Berlanjut:

1. **Periksa Logs Build**:
   - Pastikan tidak ada error saat instalasi dependensi
   - Cari baris yang menunjukkan instalasi `mysql2` dan `pg`

2. **Verifikasi Struktur Project**:
   - Pastikan file `package.json` ada di root direktori backend
   - Pastikan tidak ada direktori `node_modules` yang di-commit

3. **Gunakan Force Install**:
   - Tambahkan environment variable di Vercel:
     ```
     NPM_CONFIG_FORCE=true
     ```

4. **Periksa Versi Node.js**:
   - Pastikan versi Node.js di Vercel kompatibel dengan dependensi
   - Tambahkan ke `package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

## Catatan Penting

1. **Jangan commit node_modules** ke repository
2. **Pastikan semua dependensi runtime ada di `dependencies`**, bukan `devDependencies`
3. **Gunakan versi dependensi yang stabil** dan teruji
# PERBAIKAN MASALAH CORS PADA ENDPOINT LOGIN

## Masalah
Endpoint `https://simontok-api.vercel.app/api/users/login` mengalami error CORS:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://simontok-api.vercel.app/api/users/login. (Reason: CORS header 'Access-Control-Allow-Origin' missing). Status code: 401.
```

## Penyebab
1. Origin `https://simontok-api.vercel.app` tidak termasuk dalam daftar origin yang diizinkan di konfigurasi CORS
2. Penanganan preflight OPTIONS request perlu diperbaiki

## Solusi yang Diterapkan

### 1. Menambahkan Origin yang Diizinkan
Di file `vercel-entry.js`, menambahkan `'https://simontok-api.vercel.app'` ke daftar `allowedOrigins`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://spbu-tes.vercel.app',
  'https://pertashop-six.vercel.app',
  'https://frontend-kbrdmhe8z-kickcoock-7080s-projects.vercel.app',
  'https://simontok-ps.vercel.app',
  'https://simontok-api.vercel.app', // Tambahkan origin API
  // Tambahkan domain frontend lain jika ada
];
```

### 2. Memperbaiki Handler CORS untuk Vercel
Memperbaiki kedua handler (CommonJS dan ES6 modules) untuk memastikan semua origin yang diizinkan sudah termasuk.

### 3. Menangani Preflight OPTIONS Request
Memastikan bahwa semua preflight OPTIONS request ditangani dengan benar dengan mengatur header CORS yang sesuai.

## Cara Menguji Perbaikan

1. Deploy ulang aplikasi backend ke Vercel
2. Gunakan perintah berikut untuk menguji secara lokal:
   ```bash
   cd backend
   node cors-test.js
   ```
3. Lakukan request ke endpoint login dari origin yang diizinkan

## Pencegahan di Masa Depan

1. Pastikan semua subdomain Vercel yang digunakan sudah termasuk dalam daftar `allowedOrigins`
2. Gunakan pola wildcard jika diperlukan (dengan hati-hati)
3. Tambahkan logging untuk memudahkan debugging CORS di masa depan

## Catatan Tambahan

- Perubahan ini tidak mengganggu keamanan karena hanya menambahkan origin yang sah
- Konfigurasi tetap membatasi origin yang diizinkan sesuai dengan prinsip keamanan CORS
- Perubahan ini hanya berlaku untuk lingkungan produksi di Vercel
# SIMONTOK OPERATOR - BACKEND INTEGRATION

## Overview
Dokumen ini menjelaskan implementasi integrasi backend untuk aplikasi mobile simontok-operator. Integrasi ini mengikuti prinsip RBAC (Role-Based Access Control) dan menghubungkan aplikasi dengan API backend dengan semua relasi yang diperlukan.

## Struktur Implementasi

### 1. Services Layer
Layer services menyediakan abstraksi yang bersih antara komponen UI dan API:

1. **API Service** (`src/services/api.js`)
   - Menangani semua request HTTP
   - Mengelola token autentikasi
   - Menyediakan metode request generik (GET, POST, PUT, DELETE)

2. **Authentication Service** (`src/services/authService.js`)
   - Mengelola login/logout pengguna
   - Menangani penyimpanan dan pengambilan token
   - Menyediakan manajemen profil pengguna

3. **User Service** (`src/services/userService.js`)
   - Mengelola operasi terkait pengguna
   - Mengimplementasikan kontrol akses berbasis peran
   - Menangani fungsionalitas spesifik operator

4. **Sales Service** (`src/services/salesService.js`)
   - Mengelola transaksi penjualan
   - Mengimplementasikan pembuatan penjualan spesifik operator
   - Menangani pengambilan data penjualan

5. **RBAC Service** (`src/services/rbacService.js`)
   - Mengimplementasikan kontrol akses berbasis peran
   - Menyediakan fungsi pengecekan izin
   - Mengelola kontrol akses rute

### 2. State Management dengan Redux
Redux store mengelola state aplikasi:

1. **Auth Reducer** (`src/modules/auth/AuthReducer.js`)
   - Mengelola state autentikasi
   - Menyimpan informasi pengguna
   - Menangani state loading dan error

2. **Auth Actions** (`src/modules/auth/AuthActions.js`)
   - Mendefinisikan tipe action untuk autentikasi
   - Menyediakan action creators

3. **Auth Thunks** (`src/modules/auth/AuthThunks.js`)
   - Mengimplementasikan action asinkron
   - Menghubungkan ke authentication service

### 3. Navigasi
Sistem navigasi mengimplementasikan RBAC dengan menampilkan item menu yang berbeda berdasarkan peran pengguna.

## Detail Implementasi

### 1. Koneksi API
API service membuat koneksi ke backend di `http://localhost:3000/api` (development) atau URL produksi. Secara otomatis menangani:

- Manajemen token autentikasi
- Penanganan error request/response
- Injeksi header autentikasi

### 2. Flow Autentikasi
Flow autentikasi mengikuti langkah-langkah berikut:

1. Pengguna memasukkan kredensial di form login
2. Kredensial dikirim ke backend melalui `authService.login()`
3. Pada autentikasi berhasil:
   - Token JWT disimpan di AsyncStorage
   - Data pengguna disimpan di AsyncStorage
   - State Redux diperbarui dengan informasi pengguna
4. Pada autentikasi gagal:
   - Pesan error ditampilkan
   - Pengguna tetap di layar login

### 3. Role-Based Access Control
RBAC diimplementasikan melalui:

- **Pengecekan Peran**: Fungsi untuk mengecek apakah pengguna memiliki peran tertentu
- **Pengecekan Izin**: Fungsi untuk mengecek apakah pengguna dapat melakukan aksi tertentu
- **Kontrol Akses Rute**: Fungsi untuk mengecek apakah pengguna dapat mengakses rute tertentu
- **Filtering UI**: Item menu navigasi difilter berdasarkan peran pengguna

### 4. Relasi Data
Implementasi menangani semua relasi backend dengan benar:

- **Relasi User-Role**: Setiap pengguna memiliki peran yang menentukan izin mereka
- **Relasi User-SPBU**: Pengguna diasosiasikan dengan SPBU tertentu
- **Relasi Sales-Operator**: Transaksi penjualan dihubungkan dengan operator
- **Relasi Sales-SPBU**: Transaksi penjualan dihubungkan dengan SPBU

## Pengujian

Untuk menguji implementasi:

1. Pastikan server backend berjalan di `http://localhost:3000`
2. Jalankan aplikasi React Native
3. Coba login dengan kredensial operator yang valid
4. Verifikasi bahwa pengguna dapat mengakses fitur spesifik operator
5. Verifikasi bahwa pengguna tidak dapat mengakses fitur admin/super-admin

## Konfigurasi

Aplikasi dapat dikonfigurasi untuk environment yang berbeda:

- **Development**: Menggunakan `http://localhost:3000/api`
- **Production**: Menggunakan URL API produksi

Untuk mengubah konfigurasi, modifikasi `src/config/environment.js`.

## Pertimbangan Keamanan

1. **Penyimpanan Token**: Token JWT disimpan di AsyncStorage
2. **Kadaluarsa Token**: Token kadaluarsa setelah 30 hari
3. **Akses Tidak Sah**: Request tidak sah secara otomatis dialihkan ke login
4. **Validasi Data**: Semua input pengguna divalidasi sebelum dikirim ke backend

## Perbaikan di Masa Depan

1. Implementasi mekanisme refresh token
2. Tambahkan autentikasi biometrik
3. Implementasi sinkronisasi data offline
4. Tambahkan penanganan error yang lebih komprehensif
5. Implementasi notifikasi push untuk update real-time
# Integrasi ESP32 dengan Aplikasi Penjualan

## Gambaran Umum
Dokumen ini menjelaskan cara mengintegrasikan perangkat ESP32 dengan aplikasi penjualan operator untuk memungkinkan transaksi otomatis melalui Bluetooth.

## Prasyarat
1. Perangkat ESP32 yang telah diprogram dengan firmware `esp32_sales_transaction.ino`
2. Browser yang mendukung Web Bluetooth API (Chrome, Edge, Opera)
3. Perangkat mobile dengan Bluetooth aktif

## Fitur
1. Koneksi Bluetooth antara perangkat ESP32 dan aplikasi
2. Pengiriman data transaksi dari ESP32 ke aplikasi
3. Dua mode transaksi: Manual dan Otomatis
4. Sinkronisasi harga real-time antara aplikasi dan ESP32
5. Pemrosesan transaksi melalui API backend yang sudah ada

## Cara Kerja
1. Perangkat ESP32 mengirim data transaksi dalam format JSON melalui Bluetooth
2. Aplikasi secara otomatis menyinkronkan harga terbaru ke ESP32
3. Operator dapat memilih antara mode transaksi manual atau otomatis
4. Dalam mode otomatis dengan auto-submit aktif, transaksi diproses secara otomatis
5. Dalam mode manual atau otomatis tanpa auto-submit, operator dapat meninjau dan mengkonfirmasi transaksi
6. Transaksi diproses melalui API backend yang sama dengan input manual

## Sinkronisasi Harga
Aplikasi secara otomatis menyinkronkan harga dari sistem ke ESP32:
- Harga diambil dari API `/prices` atau data tangki
- Harga dikirim ke ESP32 setiap kali ada perubahan di form
- ESP32 memperbarui harga internalnya secara real-time
- Untuk informasi lebih detail, lihat dokumen `PRICE_SYNCHRONIZATION.md`

## Struktur Data
Format data yang dikirim oleh ESP32:
```json
{
  "fuel_type": "Pertamax",
  "liters": 10.0,
  "amount": 15000.0,
  "transaction_id": 1
}
```

## Penggunaan
1. Buka halaman Sales Management di aplikasi mobile
2. Pastikan Anda masuk sebagai Operator
3. Klik tombol "Connect to Device" di bagian Bluetooth Connection
4. Pilih perangkat "ESP32_SalesDevice" dari daftar
5. Tunggu hingga koneksi berhasil
6. Pilih mode transaksi:
   - Manual Entry: Masukkan data transaksi secara manual
   - Bluetooth Device: Gunakan perangkat ESP32
7. Jika menggunakan mode Bluetooth, pilih opsi "Auto-submit transactions" jika ingin transaksi diproses otomatis
8. Lakukan transaksi dengan menekan tombol di ESP32
9. Jika auto-submit tidak aktif, data akan muncul di form aplikasi untuk ditinjau dan dikonfirmasi
10. Jika auto-submit aktif, transaksi akan diproses secara otomatis

Catatan: Tombol "Bluetooth Device" hanya akan aktif jika browser Anda mendukung Web Bluetooth API. Jika tombol tetap tidak aktif, periksa dokumentasi troubleshooting.

## Troubleshooting
Jika mengalami masalah dengan koneksi Bluetooth, lihat dokumen terpisah `BLUETOOTH_TROUBLESHOOTING.md` untuk panduan lengkap tentang:
- Masalah umum dan solusi
- Langkah debugging
- Kompatibilitas browser
- Verifikasi firmware ESP32

## Masalah yang Sering Terjadi
1. Bluetooth tidak didukung di browser (tombol Bluetooth Device tidak aktif)
2. Perangkat tidak ditemukan
3. Koneksi gagal
4. Data tidak diterima
5. Auto-submit tidak berfungsi

Jika masalah persisten, periksa:
- Output serial monitor ESP32
- Console browser untuk error JavaScript
- Kompatibilitas browser
- Jarak antara perangkat

Catatan: Tombol "Bluetooth Device" akan dinonaktifkan jika browser Anda tidak mendukung Web Bluetooth API. Gunakan browser yang kompatibel seperti Chrome, Edge, atau Opera.
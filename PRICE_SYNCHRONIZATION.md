# Sinkronisasi Harga antara Aplikasi Web dan ESP32

## Gambaran Umum

Dokumen ini menjelaskan bagaimana harga dari sistem manajemen penjualan disinkronkan dengan perangkat ESP32 untuk memastikan konsistensi harga dalam transaksi.

## Cara Kerja Sinkronisasi Harga

### 1. Pengambilan Harga di Aplikasi Web
Aplikasi web mengambil harga dari dua sumber:
1. **Data Tangki**: Jika tangki memiliki harga saat ini
2. **API Prices**: Jika tidak ada harga di tangki, menggunakan harga terbaru dari API `/prices`

### 2. Pengiriman Harga ke ESP32
Setiap kali ada perubahan pada form data di aplikasi web:
1. Aplikasi menghitung harga per liter berdasarkan jenis bahan bakar
2. Data transaksi lengkap dikirim ke ESP32 dalam format JSON
3. ESP32 memperbarui harga internalnya

### 3. Format Data yang Dikirim
```json
{
  "fuel_type": "Pertamax",
  "liters": 10.0,
  "price_per_liter": 15000.0,
  "amount": 150000.0
}
```

## Implementasi Teknis

### Di Sisi Aplikasi Web (React)
```javascript
useEffect(() => {
  if (bluetoothConnected && transactionMode === 'bluetooth') {
    // Send transaction data to ESP32
    const transactionData = {
      fuel_type: formData.fuel_type,
      liters: formData.liters,
      price_per_liter: getCurrentPrice(formData.fuel_type),
      amount: formData.amount
    };
    
    // Send as JSON
    sendBluetoothCommand(`SET_TRANSACTION_DATA:${JSON.stringify(transactionData)}`);
  }
}, [formData, bluetoothConnected, transactionMode, getCurrentPrice]);
```

### Di Sisi ESP32
```cpp
void parseTransactionData(String jsonData) {
  // Parse JSON data
  StaticJsonDocument<300> doc;
  DeserializationError error = deserializeJson(doc, jsonData);
  
  if (error) {
    Serial.println("Failed to parse JSON: " + String(error.c_str()));
    sendResponse("ERROR", "Failed to parse JSON: " + String(error.c_str()));
    return;
  }
  
  // Update values if they exist in the JSON
  if (doc.containsKey("fuel_type")) {
    fuelType = doc["fuel_type"].as<String>();
  }
  
  if (doc.containsKey("liters")) {
    liters = doc["liters"];
  }
  
  if (doc.containsKey("price_per_liter")) {
    pricePerLiter = doc["price_per_liter"];
  }
  
  // Recalculate amount
  amount = liters * pricePerLiter;
  
  // Send confirmation
  sendResponse("TRANSACTION_DATA_SET", "OK");
}
```

## Manfaat Sinkronisasi Harga

1. **Konsistensi Harga**: Harga di ESP32 selalu sesuai dengan harga di sistem
2. **Akurasi Transaksi**: Transaksi mencerminkan harga yang benar
3. **Fleksibilitas**: Tidak perlu mengupdate firmware saat harga berubah
4. **Sinkronisasi Real-time**: Harga diperbarui secara otomatis saat operator mengubah pilihan

## Cara Menguji Sinkronisasi Harga

1. **Ubah Harga di Sistem**:
   - Masuk sebagai admin
   - Perbarui harga untuk jenis bahan bakar tertentu
   - Simpan perubahan

2. **Periksa di Aplikasi Operator**:
   - Buka halaman sales sebagai operator
   - Pilih jenis bahan bakar yang harganya diubah
   - Perhatikan apakah harga per liter berubah

3. **Periksa di ESP32**:
   - Buka Serial Monitor
   - Perhatikan pesan "Transaction data updated"
   - Periksa apakah `price_per_liter` berubah

4. **Tes Transaksi**:
   - Tekan tombol di ESP32
   - Periksa data yang dikirim apakah menggunakan harga yang benar

## Troubleshooting

### Harga Tidak Sinkron
1. **Periksa Koneksi Bluetooth**: Pastikan ESP32 terhubung dengan aplikasi
2. **Periksa Console**: Lihat apakah ada error dalam pengiriman data
3. **Periksa Format Data**: Pastikan JSON dikirim dengan format yang benar

### Harga Tidak Berubah di ESP32
1. **Periksa Serial Monitor**: Lihat apakah pesan "Transaction data updated" muncul
2. **Periksa Parsing JSON**: Pastikan tidak ada error dalam parsing data
3. **Periksa Fungsi `parseTransactionData`**: Verifikasi implementasi

### Error dalam Sinkronisasi
1. **Error Parsing JSON**: Periksa format JSON yang dikirim
2. **Error Koneksi**: Periksa koneksi Bluetooth
3. **Error Pengiriman Data**: Periksa apakah data dikirim dengan benar
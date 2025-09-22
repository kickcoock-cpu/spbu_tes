# Perbaikan UUID Bluetooth Service

## Masalah
Error dalam koneksi Bluetooth karena UUID service tidak sesuai dengan format yang diharapkan oleh Web Bluetooth API:
```
TypeError: Failed to execute 'requestDevice' on 'Bluetooth': Invalid Service name: '00001101-0000-1000-8000-00805F9B34FB'. It must be a valid UUID alias (e.g. 0x1234), UUID (lowercase hex characters e.g. '00001234-0000-1000-8000-00805f9b34fb'), or recognized standard name from https://www.bluetooth.com/specifications/gatt/services e.g. 'alert_notification'.
```

## Solusi
Mengubah format UUID service dari uppercase menjadi lowercase:
- Sebelum: `'00001101-0000-1000-8000-00805F9B34FB'`
- Sesudah: `'00001101-0000-1000-8000-00805f9b34fb'`

## File yang Diperbaiki
1. `enhanced-mobile-operator-sales.tsx`
2. `mobile-operator-sales-ble.tsx`
3. `mobile-sales-form-ble.tsx`
4. `mobile-operator-sales.tsx`

## Fungsi yang Diperbaiki
1. `scanBluetoothDevices()` - Memperbaiki UUID dalam parameter `optionalServices`
2. `connectBluetooth()` - Memperbaiki UUID dalam:
   - Parameter `optionalServices` untuk `requestDevice()`
   - Parameter untuk `getPrimaryService()`
   - Parameter untuk `getCharacteristic()`

## Detail Perubahan
Semua instance UUID `'00001101-0000-1000-8000-00805F9B34FB'` diubah menjadi `'00001101-0000-1000-8000-00805f9b34fb'` (huruf kecil pada bagian akhir).

## Verifikasi
Setelah perubahan ini, koneksi Bluetooth seharusnya berfungsi dengan baik tanpa error terkait format UUID.
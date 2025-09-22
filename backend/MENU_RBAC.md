# Konfigurasi Role-Based Access Control (RBAC) untuk Menu

Dokumen ini menjelaskan bagaimana sistem RBAC diterapkan pada menu di aplikasi SPBU Management System.

## 1. Struktur Konfigurasi Role

Konfigurasi role disimpan di `backend/config/roles.js` dalam format objek JavaScript:

```javascript
const roles = {
  'Role Name': {
    'permission_key': 'access_level'
  }
}
```

## 2. Role yang Tersedia

### 2.1. Super Admin
Role dengan akses penuh ke seluruh sistem.

**Permission Configuration:**
```javascript
'Super Admin': {
  dashboard: 'full',
  users: 'full',        // Create, Read, Update, Delete
  spbu: 'full',         // Create, Read, Update, Delete
  sales: 'read-only',
  deliveries: 'full',   // Create, Read, Update, Approve/Confirm
  deposits: 'full',     // Create, Read, Update, Approve/Reject
  prices: 'full',       // Create, Read, Update
  reports: 'full',
  attendance: 'read-only',
  adjustments: 'full',  // Create, Read, Update, Approve/Reject
  audit: 'full',
  prediction: 'full'
}
```

### 2.2. Admin
Role dengan akses terbatas untuk mengelola satu SPBU.

**Permission Configuration:**
```javascript
'Admin': {
  dashboard: 'full',
  users: 'read-only',
  spbu: 'read-only',
  sales: 'read-only',
  deliveries: 'full',   // Create, Read, Update, Approve/Confirm
  deposits: 'full',     // Create, Read, Update, Approve/Reject
  prices: 'full',       // Create, Read, Update for their SPBU
  reports: 'full',      // SPBU-specific reports
  attendance: 'read-only',
  adjustments: 'full',  // Create, Read, Update, Approve/Reject for their SPBU
  audit: 'read-only',
  prediction: 'read-only'
}
```

### 2.3. Operator
Role dengan akses operasional sehari-hari.

**Permission Configuration:**
```javascript
'Operator': {
  dashboard: 'full',
  users: 'none',
  spbu: 'none',
  sales: 'full',        // Create sales transactions
  deliveries: 'limited', // Confirm deliveries
  deposits: 'limited',  // Create deposits
  prices: 'read-only',
  reports: 'limited',   // Limited report access
  attendance: 'full',   // Check-in/Check-out access
  adjustments: 'limited', // Create adjustment requests
  audit: 'none',
  prediction: 'none'
}
```

**Akses Deposits:**
- Dapat membuat deposit
- Dapat melihat daftar deposit untuk SPBU mereka
- Dapat melihat detail deposit
- Tidak dapat menyetujui atau menolak deposit (hanya Super Admin dan Admin yang bisa)

## 3. Tingkat Akses (Access Levels)

### 3.1. full
Akses penuh ke semua operasi:
- Create (Membuat data baru)
- Read (Melihat data)
- Update (Mengedit data)
- Delete (Menghapus data)
- Approve/Reject (Untuk transaksi yang memerlukan persetujuan)

### 3.2. read-only
Hanya akses baca:
- Melihat data
- Tidak dapat membuat, mengedit, atau menghapus data
- Form akan ditampilkan dalam mode read-only

### 3.3. limited
Akses terbatas:
- Hanya operasi tertentu yang diizinkan
- Biasanya untuk operasi konfirmasi atau pembuatan data dasar
- Beberapa tombol akan dinonaktifkan

### 3.4. none
Tidak ada akses:
- Menu tidak akan ditampilkan untuk role ini
- Jika diakses secara langsung, akan menampilkan error 403

## 4. Penerapan di Menu Controller

Penerapan RBAC dilakukan di `backend/controllers/menuController.js`:

```javascript
// Filter menu berdasarkan permission user
const filteredMenu = fullMenu.filter(item => {
  // Jika user memiliki akses penuh
  if (rolePermissions[item.permission] === 'full') {
    return true;
  }
  
  // Jika user memiliki akses read-only
  if (rolePermissions[item.permission] === 'read-only') {
    return true;
  }
  
  // Jika user memiliki akses terbatas
  if (rolePermissions[item.permission] === 'limited') {
    return true;
  }
  
  // Tidak ada akses
  return false;
}).map(item => {
  // Clone item untuk menghindari modifikasi original
  const filteredItem = { ...item };
  
  // Tandai item sebagai read-only jika perlu
  if (rolePermissions[item.permission] === 'read-only') {
    filteredItem.readOnly = true;
  }
  
  // Tandai item sebagai limited jika perlu
  if (rolePermissions[item.permission] === 'limited') {
    filteredItem.limited = true;
  }
  
  return filteredItem;
});
```

## 5. Implementasi di Frontend

### 5.1. Penandaan Read-Only dan Limited

Di frontend, menu items akan memiliki properti tambahan:
- `readOnly: true` - Untuk menu dengan akses read-only
- `limited: true` - Untuk menu dengan akses terbatas

### 5.2. Penanganan di Komponen CRUD

Komponen CRUD (`crud-page.tsx` dan `crud-form.tsx`) akan menyesuaikan perilaku berdasarkan permission:

```javascript
// Di CrudPage component
if (readOnly) {
  // Hanya tampilkan tombol view/detail
  // Sembunyikan tombol edit dan delete
}

if (limited) {
  // Nonaktifkan tombol delete
  // Batasi operasi tertentu
}
```

### 5.3. Penanganan di Form

Form akan menyesuaikan field berdasarkan permission:
- Untuk read-only: Field dinonaktifkan
- Untuk limited: Hanya field tertentu yang dapat diedit

## 6. Mapping Menu ke Permission

Berikut adalah mapping antara menu items dan permission keys:

| Menu Item | Permission Key | Deskripsi |
|-----------|----------------|-----------|
| Dashboard | `dashboard` | Halaman dashboard utama |
| Users Management | `users` | Manajemen pengguna |
| SPBU Management | `spbu` | Manajemen SPBU |
| Sales | `sales` | Transaksi penjualan |
| Deliveries | `deliveries` | Manajemen pengiriman |
| Deposits | `deposits` | Manajemen deposit |
| Prices | `prices` | Manajemen harga |
| Reports | `reports` | Laporan dan analitik |
| Attendance | `attendance` | Manajemen absensi |
| Adjustments | `adjustments` | Penyesuaian dan permintaan |
| Audit Logs | `audit` | Log audit sistem |
| Predictions | `prediction` | Prediksi dan analisis |

## 7. Implementasi Submenu

Submenu juga mengikuti aturan RBAC yang sama dengan parent menu:

```javascript
{
  id: 'users',
  label: 'Users Management',
  icon: 'group',
  route: '/users',
  permission: 'users',
  submenu: [
    {
      id: 'users-list',
      label: 'All Users',
      icon: 'list',
      route: '/users',
      // Submenu mewarisi permission dari parent
    },
    {
      id: 'users-create',
      label: 'Add User',
      icon: 'add',
      route: '/users/create',
      // Submenu mewarisi permission dari parent
    }
  ]
}
```

## 8. Pengujian RBAC

### 8.1. Pengujian untuk Setiap Role

Setiap role harus diuji untuk memastikan:
- Menu yang ditampilkan sesuai
- Akses ke halaman sesuai
- Operasi CRUD sesuai permission

### 8.2. Pengujian Edge Cases

- Akses langsung ke URL yang tidak diizinkan
- Refresh halaman setelah perubahan role
- Penanganan error 403

## 9. Pemeliharaan dan Pembaruan

### 9.1. Menambahkan Permission Baru

1. Tambahkan permission key ke semua role
2. Tambahkan menu item dengan permission key yang sesuai
3. Uji untuk semua role

### 9.2. Memodifikasi Tingkat Akses

1. Ubah nilai permission di `roles.js`
2. Restart backend server
3. Uji perubahan

## 10. Best Practices

### 10.1. Konsistensi

- Gunakan naming convention yang konsisten untuk permission keys
- Pastikan deskripsi permission jelas dan mudah dipahami

### 10.2. Dokumentasi

- Dokumentasikan setiap perubahan permission
- Jaga agar dokumentasi selalu up-to-date

### 10.3. Keamanan

- Jangan hanya mengandalkan filtering frontend
- Selalu implementasikan validasi di backend
- Gunakan middleware authorization untuk setiap endpoint

Dengan konfigurasi RBAC yang tepat, sistem dapat memberikan pengalaman pengguna yang aman dan sesuai dengan peran masing-masing pengguna.
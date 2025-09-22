# Cara Menambahkan Menu Items Baru

Dokumen ini menjelaskan langkah-langkah untuk menambahkan menu items baru ke sistem sidebar dinamis dengan CRUD otomatis.

## 1. Menambahkan Menu Item di Backend

### 1.1. Memodifikasi Menu Controller

Buka file `backend/controllers/menuController.js` dan tambahkan menu item baru ke array `fullMenu`:

```javascript
const fullMenu = [
  // Menu items yang sudah ada...
  {
    id: 'new-menu',           // ID unik untuk menu
    label: 'New Menu',        // Label yang akan ditampilkan
    icon: 'new_icon',         // Nama icon (harus sesuai dengan mapping di frontend)
    route: '/new-menu',       // Route untuk menu ini
    permission: 'new-menu',   // Permission yang diperlukan
    submenu: [                // Opsional: submenu items
      {
        id: 'new-menu-list',
        label: 'All Items',
        icon: 'list',
        route: '/new-menu',
      },
      {
        id: 'new-menu-create',
        label: 'Add New',
        icon: 'add',
        route: '/new-menu/create',
      }
    ]
  }
];
```

### 1.2. Menambahkan Permission untuk Role

Buka file `backend/config/roles.js` dan tambahkan permission untuk setiap role:

```javascript
const roles = {
  'Super Admin': {
    // Permissions yang sudah ada...
    'new-menu': 'full',       // Full access
  },
  'Admin': {
    // Permissions yang sudah ada...
    'new-menu': 'read-only',  // Read-only access
  },
  'Operator': {
    // Permissions yang sudah ada...
    'new-menu': 'limited',    // Limited access
  }
};
```

Nilai permission yang tersedia:
- `'full'`: Akses penuh (Create, Read, Update, Delete)
- `'read-only'`: Hanya akses baca
- `'limited'`: Akses terbatas
- `'none'`: Tidak ada akses

## 2. Menambahkan Icon Mapping di Frontend (Jika Diperlukan)

Jika Anda menggunakan icon yang belum ada di mapping, tambahkan ke file `frontend/src/components/layout/dynamic-sidebar.tsx`:

```javascript
const iconMap: Record<string, React.ElementType> = {
  // Icon mappings yang sudah ada...
  'new_icon': NewIconComponent,  // Impor dan tambahkan komponen icon baru
};
```

## 3. Membuat Endpoint API untuk Resource Baru (Jika Diperlukan)

Jika Anda membuat menu untuk resource yang belum ada, Anda perlu membuat endpoint API baru:

### 3.1. Membuat Model (Jika Diperlukan)

Buat file model baru di `backend/models/NewModel.js`:

```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NewModel = sequelize.define('NewModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'new_models',
  timestamps: true
});

module.exports = NewModel;
```

### 3.2. Membuat Controller

Buat file controller baru di `backend/controllers/newModelController.js`:

```javascript
const NewModel = require('../models/NewModel');

// @desc    Get all new models
// @route   GET /api/new-menu
// @access  Private
const getNewModels = async (req, res) => {
  try {
    const newModels = await NewModel.findAll();
    res.status(200).json({
      success: true,
      count: newModels.length,
      data: newModels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Tambahkan fungsi lain sesuai kebutuhan (getNewModel, createNewModel, updateNewModel, deleteNewModel)

module.exports = {
  getNewModels
  // Export fungsi lain
};
```

### 3.3. Membuat Route

Buat file route baru di `backend/routes/newMenu.js`:

```javascript
const express = require('express');
const router = express.Router();
const { getNewModels } = require('../controllers/newModelController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getNewModels);

module.exports = router;
```

### 3.4. Mendaftarkan Route

Tambahkan route baru ke `backend/index.js`:

```javascript
app.use('/api/new-menu', require('./routes/newMenu'));
```

## 4. Menjalankan Ulang Aplikasi Frontend

Setelah menambahkan menu item baru di backend, jalankan ulang aplikasi frontend untuk meng-generate route secara otomatis:

```bash
cd frontend
npm run dev
```

Sistem akan secara otomatis:
1. Mengambil menu terbaru dari API
2. Meng-generate route yang diperlukan
3. Membuat halaman CRUD otomatis

## 5. Memodifikasi Form CRUD (Opsional)

Jika Anda ingin menyesuaikan field pada form CRUD, modifikasi file `frontend/src/components/crud/crud-form.tsx`. Untuk saat ini, form menggunakan field statis, tetapi dalam implementasi yang lebih lanjut, Anda bisa mengambil schema dari API.

## 6. Mengatur Validasi Form (Opsional)

Untuk menambahkan validasi kustom, modifikasi schema Zod di `frontend/src/components/crud/crud-form.tsx`:

```javascript
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  // Tambahkan field lain sesuai kebutuhan
});
```

## 7. Contoh Lengkap

Berikut adalah contoh lengkap menambahkan menu "Inventory" untuk mengelola barang:

### 7.1. Backend - Menu Controller

```javascript
// Di backend/controllers/menuController.js
{
  id: 'inventory',
  label: 'Inventory',
  icon: 'package',
  route: '/inventory',
  permission: 'inventory',
  submenu: [
    {
      id: 'inventory-list',
      label: 'All Items',
      icon: 'list',
      route: '/inventory',
    },
    {
      id: 'inventory-create',
      label: 'Add Item',
      icon: 'add',
      route: '/inventory/create',
    }
  ]
}
```

### 7.2. Backend - Roles Configuration

```javascript
// Di backend/config/roles.js
const roles = {
  'Super Admin': {
    // ...
    'inventory': 'full',
  },
  'Admin': {
    // ...
    'inventory': 'full',
  },
  'Operator': {
    // ...
    'inventory': 'read-only',
  }
};
```

### 7.3. Frontend - Icon Mapping (Jika diperlukan)

```javascript
// Di frontend/src/components/layout/dynamic-sidebar.tsx
import { Package } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  // ...
  'package': Package,
};
```

Setelah semua langkah di atas dilakukan, restart server backend dan frontend, maka menu baru akan muncul secara otomatis di sidebar sesuai dengan role pengguna.
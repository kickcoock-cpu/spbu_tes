// Entry point khusus untuk Vercel Serverless Functions
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.vercel' }); // Load .env.vercel file

// Log environment variables for debugging (remove in production)
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD present:', !!process.env.DB_PASSWORD);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
console.log('==============================');

// Inisialisasi koneksi database dengan konfigurasi khusus untuk Vercel
let sequelize;
try {
  const { Sequelize } = require('sequelize');
  
  // Gunakan connection string jika tersedia
  if (process.env.POSTGRES_URL) {
    console.log('Using connection string for Vercel database connection');
    sequelize = new Sequelize(process.env.POSTGRES_URL, {
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      ssl: true
    });
  } else {
    // Fallback ke konfigurasi manual dengan SSL settings yang lebih eksplisit
    sequelize = new Sequelize(
      process.env.DB_NAME || 'postgres',
      process.env.DB_USER || 'postgres.eqwnpfuuwpdsacyvdrvj',
      process.env.DB_PASSWORD || 'RAjevhNTBYzbD9oO',
      {
        host: process.env.DB_HOST || 'aws-1-us-east-1.pooler.supabase.com',
        port: process.env.DB_PORT || 6543,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        ssl: true,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }
  
  // Test koneksi
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established for Vercel');
    })
    .catch(err => {
      console.error('❌ Unable to connect to the database in Vercel:', err.message);
    });
} catch (error) {
  console.error('❌ Error initializing database connection:', error);
}

// Fungsi connectDB khusus untuk Vercel
const connectDB = async () => {
  try {
    if (sequelize) {
      await sequelize.authenticate();
      console.log('✅ Koneksi database berhasil terestablish di Vercel.');
    }
  } catch (error) {
    console.error('❌ Gagal menghubungkan ke database di Vercel:', error);
  }
};

// Inisialisasi aplikasi Express
const app = express();

// Middleware CORS yang benar untuk produksi
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Untuk development, izinkan localhost
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Untuk produksi, tentukan origin yang diizinkan
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://spbu-tes.vercel.app',
      'https://pertashop-six.vercel.app',
      'https://frontend-kbrdmhe8z-kickcoock-7080s-projects.vercel.app',
      'https://simontok-ps.vercel.app',
      // Tambahkan domain frontend lain jika ada
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Logging middleware untuk debugging
app.use((req, res, next) => {
  console.log(`=== INCOMING REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Origin: ${req.headers.origin}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, req.body);
  }
  next();
});

// Koneksi ke database dengan error handling
connectDB().catch((error) => {
  console.error('❌ Gagal menghubungkan ke database:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  // Jangan throw error agar server tetap bisa jalan untuk health check
});

// Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/spbu', require('./routes/spbu'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/reports/ledger', require('./routes/ledger'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/adjustments', require('./routes/adjustments'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/prediction', require('./routes/prediction'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/tanks', require('./routes/tanks'));
app.use('/api/suspicious', require('./routes/suspicious'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL/Supabase'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Export handler untuk Vercel
module.exports = (req, res) => {
  // Set CORS headers secara manual untuk OPTIONS request
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://spbu-tes.vercel.app',
    'https://pertashop-six.vercel.app',
    'https://frontend-kbrdmhe8z-kickcoock-7080s-projects.vercel.app',
    'https://simontok-ps.vercel.app',
    // Tambahkan domain frontend lain jika ada
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Pass request to express app
  return app(req, res);
};

// Untuk development local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
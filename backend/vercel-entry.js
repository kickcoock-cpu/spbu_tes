// Entry point khusus untuk Vercel Serverless Functions
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.vercel' });

// Log environment variables for debugging (remove in production)
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Inisialisasi koneksi database
const { connectDB } = require('./config/db');

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors({
  origin: "*", // Untuk development, gunakan "*" - di produksi gunakan domain frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Logging middleware untuk debugging
app.use((req, res, next) => {
  console.log(`=== INCOMING REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, req.body);
  }
  next();
});

// Koneksi ke database
connectDB().catch((error) => {
  console.error('Gagal menghubungkan ke database:', error);
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
    database: process.env.DB_DIALECT === 'postgres' ? 'Supabase/PostgreSQL' : 'MySQL'
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  
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
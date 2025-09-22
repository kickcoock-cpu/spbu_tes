// Entry point khusus untuk Supabase dan Vercel Serverless Functions
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/supabase-db');
require('dotenv').config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Koneksi ke database Supabase
console.log('Initializing database connection...');
connectDB().catch((error) => {
  console.error('Failed to connect to database:', error);
});

// Routes
console.log('Loading routes...');
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
    message: 'Server is running with Supabase',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Application Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Export handler untuk Vercel
module.exports = (req, res) => {
  try {
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
  } catch (error) {
    console.error('Handler Error:', error);
    res.status(500).json({
      success: false,
      message: 'Handler error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Untuk development local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Supabase`);
  });
}
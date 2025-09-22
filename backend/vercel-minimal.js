// Entry point minimal untuk Vercel Serverless Functions
const express = require('express');

// Buat aplikasi Express
const app = express();

// Middleware sederhana
app.use(express.json());

// Route sederhana untuk testing
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Serverless function is working',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthy',
    timestamp: new Date().toISOString()
  });
});

// Tangani semua route lainnya
app.use('*', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Route matched: ' + req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('App Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export sebagai Vercel handler
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
// Test script for CORS configuration
const express = require('express');
const cors = require('cors');

// Create a simple test server
const app = express();

// Middleware
app.use(express.json());

// CORS configuration that matches our vercel-entry.js
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
      'https://simontok-api.vercel.app', // Tambahkan origin API
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

// Test route
app.post('/api/users/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS configuration is working correctly',
    token: 'test-token',
    data: {
      id: 1,
      name: 'Test User'
    }
  });
});

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS Test Server is running'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CORS Test Server running on port ${PORT}`);
  console.log('Test endpoint: http://localhost:3001/api/users/login');
});
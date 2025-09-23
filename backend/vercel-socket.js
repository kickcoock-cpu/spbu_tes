// Vercel Socket Handler - Alternatif untuk WebSocket di Vercel Serverless
const express = require('express');
const cors = require('cors');

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Store untuk menyimpan data real-time sementara
const realtimeDataStore = new Map();

// Endpoint untuk polling data dashboard
app.get('/api/realtime/dashboard', (req, res) => {
  try {
    const dashboardData = realtimeDataStore.get('dashboard') || {
      success: true,
      data: {
        totalLiters: 0,
        totalSalesCount: 0,
        stockPredictions: [],
        tankStocks: [],
        recentSales: [],
        recentDeliveries: [],
        timestamp: new Date().toISOString()
      }
    };
    
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Endpoint untuk polling prediksi stockout
app.get('/api/realtime/stockout-predictions', (req, res) => {
  try {
    const { spbuId, fuelType } = req.query;
    const key = `stockout-${spbuId || 'all'}-${fuelType || 'all'}`;
    const predictionsData = realtimeDataStore.get(key) || {
      success: true,
      data: {
        predictions: [],
        timestamp: new Date().toISOString()
      }
    };
    
    res.status(200).json(predictionsData);
  } catch (error) {
    console.error('Error fetching stockout predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stockout predictions',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Endpoint untuk update data real-time (dipanggil oleh backend)
app.post('/api/realtime/update', (req, res) => {
  try {
    const { type, data } = req.body;
    
    switch (type) {
      case 'dashboard':
        realtimeDataStore.set('dashboard', {
          success: true,
          data: data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'stockout-predictions':
        const { spbuId, fuelType } = data;
        const key = `stockout-${spbuId || 'all'}-${fuelType || 'all'}`;
        realtimeDataStore.set(key, {
          success: true,
          data: data,
          timestamp: new Date().toISOString()
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid update type'
        });
    }
    
    res.status(200).json({
      success: true,
      message: 'Data updated successfully'
    });
  } catch (error) {
    console.error('Error updating real-time data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update real-time data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real-time API is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIMONTOK Real-time API',
    version: '1.0.0',
    endpoints: {
      'GET /api/realtime/dashboard': 'Get dashboard data',
      'GET /api/realtime/stockout-predictions': 'Get stockout predictions',
      'POST /api/realtime/update': 'Update real-time data',
      'GET /health': 'Health check'
    }
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
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Export handler untuk Vercel
module.exports = app;

// Untuk development local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Real-time server running on port ${PORT}`);
  });
}
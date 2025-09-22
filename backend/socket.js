// File ini mengatur Socket.IO untuk kompatibilitas dengan Vercel
const { Server } = require('socket.io');

// Inisialisasi server HTTP (will be provided by the main app)
let server;

// Inisialisasi Socket.IO dengan konfigurasi untuk Vercel
let io;

// Store connected clients
const connectedClients = new Map();

// Function to initialize socket with server
const initializeSocket = (httpServer) => {
  server = httpServer;
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Add client to connected clients
    connectedClients.set(socket.id, socket);
    
    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedClients.delete(socket.id);
    });
    
    // Handle dashboard data requests
    socket.on('requestDashboardData', async () => {
      try {
        // Import dashboard controller function
        const { getDashboard } = require('./controllers/dashboardController');
        
        // We need to identify the user associated with this socket
        // For now, we'll send a generic response and let the client request again
        // In a real implementation, you might store user info with the socket connection
        socket.emit('dashboardDataUpdate', {
          success: true,
          data: {
            totalLiters: 0,
            totalSalesCount: 0,
            stockPredictions: [],
            tankStocks: [],
            recentSales: [],
            recentDeliveries: []
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        socket.emit('dashboardDataError', { message: 'Failed to fetch dashboard data' });
      }
    });
    
    // Handle real-time stockout prediction requests
    socket.on('requestStockoutPredictions', async (data) => {
      try {
        const { spbuId, fuelType } = data || {};
        
        // Import real-time stockout service
        const { getStockoutPredictions } = require('./services/realtime-stockout-service');
        
        // Get real-time stockout predictions
        const predictions = await getStockoutPredictions({
          spbuId,
          fuelType
        });
        
        // Send predictions to client
        socket.emit('stockoutPredictionsUpdate', {
          success: true,
          data: {
            predictions,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error fetching stockout predictions:', error);
        socket.emit('stockoutPredictionsError', { 
          message: 'Failed to fetch stockout predictions',
          error: error.message 
        });
      }
    });
  });
};

// Simpan instance io untuk digunakan di modul lain
module.exports = { initializeSocket, io, connectedClients };
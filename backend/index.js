const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { connectDB } = require('./config/db');
const { getLocalIP, getAllLocalIPs } = require('./utils/network');
const { initializeSocket, connectedClients } = require('./socket');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO using our new approach
initializeSocket(server);

// Get local IP addresses
const localIP = getLocalIP();
const allLocalIPs = getAllLocalIPs();

console.log('=== Network Configuration ===');
console.log('Local IP:', localIP);
console.log('All Local IPs:', allLocalIPs);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost requests
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow requests from local network IPs
    if (origin.match(/^http:\/\/192\.168\.\d+\.\d+:/) || 
        origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:/) || 
        origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:/)) {
      return callback(null, true);
    }
    
    // Allow requests from our local IPs
    for (const ip of allLocalIPs) {
      if (origin === `http://${ip}:3000` || origin === `http://${ip}:5173`) {
        return callback(null, true);
      }
    }
    
    // Reject all other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  // Also log the local IP address for convenience
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const [name, interfaces] of Object.entries(nets)) {
    for (const iface of interfaces) {
      if (!iface.internal && iface.family === 'IPv4') {
        console.log(`Network access: http://${iface.address}:${PORT}`);
      }
    }
  }
});
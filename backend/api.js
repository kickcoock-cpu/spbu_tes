// Versi index.js yang dimodifikasi untuk kompatibilitas dengan Vercel
const { app, server, io } = require('./socket');
const { connectDB } = require('./config/db');
require('dotenv').config();

// Connect to database
connectDB();

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Tambahkan event listeners untuk Socket.IO di sini jika diperlukan
});

// Export untuk Vercel
module.exports = (req, res) => {
  // Untuk permintaan API, gunakan app
  return app(req, res);
};

// Hanya jalankan server jika tidak dalam environment Vercel
if (!process.env.NOW_REGION) {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  
  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}
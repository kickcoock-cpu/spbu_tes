// File ini mengatur Socket.IO untuk kompatibilitas dengan Vercel
const app = require('./server');
const { Server } = require('socket.io');

// Inisialisasi server HTTP
const server = require('http').createServer(app);

// Inisialisasi Socket.IO dengan konfigurasi untuk Vercel
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Simpan instance io untuk digunakan di modul lain
module.exports = { app, server, io };
// File untuk menguji koneksi database
const { connectDB } = require('./config/db');

console.log('Menguji koneksi database...');

connectDB()
  .then(() => {
    console.log('Koneksi ke database berhasil!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Koneksi ke database gagal:', error);
    process.exit(1);
  });
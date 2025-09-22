// File untuk menguji koneksi database Supabase
const { connectDB } = require('./config/db');

console.log('Menguji koneksi database Supabase...');

connectDB()
  .then(() => {
    console.log('Koneksi ke Supabase berhasil!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Koneksi ke Supabase gagal:', error);
    process.exit(1);
  });
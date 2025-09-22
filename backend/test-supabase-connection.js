// File untuk mengetes koneksi database Supabase secara terpisah
const { connectDB } = require('./config/supabase-db');

console.log('=== Supabase Database Connection Test ===');
console.log('Testing connection to Supabase database...');

connectDB()
  .then(() => {
    console.log('✅ Koneksi ke Supabase berhasil!');
    console.log('🎉 Database connection test completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Koneksi ke Supabase gagal:', error.message);
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Pastikan kredensial Supabase sudah benar');
    console.error('   2. Pastikan project Supabase sudah aktif');
    console.error('   3. Pastikan koneksi internet tersedia');
    console.error('   4. Periksa apakah ada firewall yang memblokir koneksi');
    process.exit(1);
  });
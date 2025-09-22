// Script untuk menjalankan migrasi schema ke Supabase
const { sequelize } = require('./config/supabase-db');
const fs = require('fs');
const path = require('path');

console.log('=== Supabase Schema Migration ===');

async function runMigration() {
  try {
    console.log('1. Membaca file schema...');
    const schemaPath = path.join(__dirname, 'database', 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ File schema berhasil dibaca');
    
    console.log('2. Menjalankan migrasi secara keseluruhan...');
    
    // Jalankan seluruh schema SQL sekaligus
    await sequelize.query(schemaSQL);
    
    console.log('✅ Migrasi schema berhasil!');
    console.log('\n🚀 Langkah selanjutnya:');
    console.log('   1. Jalankan npm run seed-supabase untuk mengisi data awal');
    console.log('   2. Test koneksi dengan npm run test-supabase');
    
  } catch (error) {
    console.error('❌ Migrasi schema gagal:', error.message);
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Periksa koneksi database');
    console.error('   2. Pastikan file schema ada dan dapat dibaca');
    console.error('   3. Periksa apakah ada query yang tidak valid');
  } finally {
    // Tutup koneksi
    try {
      await sequelize.close();
      console.log('🔒 Koneksi database ditutup');
    } catch (closeError) {
      console.error('⚠️  Gagal menutup koneksi database:', closeError.message);
    }
  }
}

// Jalankan migrasi
runMigration();
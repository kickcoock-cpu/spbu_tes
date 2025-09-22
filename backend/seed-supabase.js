// Script untuk menjalankan seed data ke Supabase
const { sequelize } = require('./config/supabase-db');
const fs = require('fs');
const path = require('path');

console.log('=== Supabase Data Seed ===');

async function runSeed() {
  try {
    console.log('1. Membaca file seed...');
    const seedPath = path.join(__dirname, 'database', 'supabase-seed.sql');
    let seedSQL = fs.readFileSync(seedPath, 'utf8');
    console.log('✅ File seed berhasil dibaca');
    
    console.log('2. Memproses file seed...');
    // Hapus komentar satu baris
    seedSQL = seedSQL.replace(/--.*$/gm, '');
    
    console.log('3. Memisahkan queries...');
    // Pisahkan query berdasarkan titik koma
    const queries = seedSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);
    
    console.log(`✅ Ditemukan ${queries.length} queries untuk dijalankan`);
    
    console.log('4. Menjalankan seed data...');
    let executedQueries = 0;
    let failedQueries = 0;
    
    // Jalankan semua query
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.length === 0) continue;
      
      const queryType = query.substring(0, Math.min(30, query.length)).toUpperCase();
      
      try {
        console.log(`   Menjalankan query ${i + 1}/${queries.length}: ${queryType.substring(0, 30)}...`);
        await sequelize.query(query);
        executedQueries++;
        console.log(`   ✅ Query ${i + 1} berhasil`);
      } catch (error) {
        // Jika error karena data sudah ada, lanjutkan
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          console.log(`   ⚠️  Query ${i + 1} dilewati (sudah ada)`);
          executedQueries++;
          continue;
        }
        
        console.error(`   ❌ Query ${i + 1} gagal:`, error.message.substring(0, 100));
        failedQueries++;
        // Jangan hentikan proses, lanjutkan ke query berikutnya
      }
    }
    
    console.log(`✅ ${executedQueries}/${queries.length} queries berhasil dijalankan (${failedQueries} gagal)`);
    
    console.log('🎉 Seed data selesai!');
    console.log('\n🚀 Langkah selanjutnya:');
    console.log('   1. Test koneksi dengan npm run test-supabase');
    console.log('   2. Jalankan aplikasi dengan npm start');
    
  } catch (error) {
    console.error('❌ Seed data gagal:', error.message);
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Periksa koneksi database');
    console.error('   2. Pastikan schema telah dibuat terlebih dahulu');
    console.error('   3. Pastikan file seed ada dan dapat dibaca');
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

// Jalankan seed
runSeed();
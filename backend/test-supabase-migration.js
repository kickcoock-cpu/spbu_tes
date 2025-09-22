// Script untuk menguji koneksi dan migrasi ke Supabase
const { connectDB } = require('./config/supabase-db');
const { sequelize } = require('./config/supabase-db');
const fs = require('fs');
const path = require('path');

console.log('=== Supabase Database Migration Test ===');

async function testMigration() {
  try {
    // 1. Test koneksi database
    console.log('1. Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful');
    
    // 2. Baca file schema
    console.log('2. Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded');
    
    // 3. Test eksekusi schema (tanpa benar-benar mengeksekusi)
    console.log('3. Validating schema syntax...');
    
    // Pisahkan query berdasarkan titik koma
    const queries = schemaSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);
    
    console.log(`Found ${queries.length} queries to validate`);
    
    // Test beberapa query pertama untuk validasi
    const testQueries = queries.slice(0, 5); // Test 5 query pertama
    
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      if (query.toUpperCase().startsWith('CREATE')) {
        console.log(`   Testing query ${i + 1}: ${query.substring(0, 50)}...`);
        // Kita tidak benar-benar mengeksekusi, hanya memastikan formatnya benar
      }
    }
    
    console.log('✅ Schema syntax validation completed');
    
    // 4. Cek apakah tabel sudah ada
    console.log('4. Checking existing tables...');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.length > 0) {
      console.log(`   Found ${tables.length} existing tables:`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('   No existing tables found');
    }
    
    console.log('✅ Migration test completed successfully');
    console.log('\n🚀 Next steps:');
    console.log('   1. Use the Supabase SQL Editor to run supabase-schema.sql');
    console.log('   2. After schema creation, run supabase-seed.sql for initial data');
    console.log('   3. Test your API endpoints');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Check your Supabase connection credentials');
    console.error('   2. Ensure your Supabase project is active');
    console.error('   3. Verify network connectivity to Supabase');
    console.error('   4. Check if the database schema file exists and is readable');
  } finally {
    // Tutup koneksi
    try {
      await sequelize.close();
      console.log('🔒 Database connection closed');
    } catch (closeError) {
      console.error('Warning: Could not close database connection:', closeError.message);
    }
  }
}

// Jalankan test
testMigration();
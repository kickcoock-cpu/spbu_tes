// Script untuk memverifikasi data awal di Supabase
const { sequelize } = require('./config/supabase-db');

console.log('=== Verifikasi Data Awal Supabase ===');

async function verifyData() {
  try {
    console.log('1. Memeriksa tabel yang ada...');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    
    console.log(`✅ Ditemukan ${tables.length} tabel:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log('\n2. Memeriksa data awal...');
    
    // Periksa roles
    console.log('   Memeriksa roles...');
    const [roles] = await sequelize.query('SELECT * FROM roles ORDER BY id');
    console.log(`   ✅ Ditemukan ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`      - ${role.id}: ${role.name}`);
    });
    
    // Periksa fuel_types
    console.log('   Memeriksa fuel_types...');
    const [fuelTypes] = await sequelize.query('SELECT * FROM fuel_types ORDER BY id');
    console.log(`   ✅ Ditemukan ${fuelTypes.length} fuel types:`);
    fuelTypes.forEach(fuel => {
      console.log(`      - ${fuel.id}: ${fuel.name}`);
    });
    
    // Periksa spbus
    console.log('   Memeriksa SPBU...');
    const [spbus] = await sequelize.query('SELECT * FROM spbus ORDER BY id');
    console.log(`   ✅ Ditemukan ${spbus.length} SPBU:`);
    spbus.forEach(spbu => {
      console.log(`      - ${spbu.id}: ${spbu.name} (${spbu.code})`);
    });
    
    // Periksa users
    console.log('   Memeriksa users...');
    const [users] = await sequelize.query('SELECT * FROM users ORDER BY id LIMIT 5');
    console.log(`   ✅ Ditemukan ${users.length} users (menampilkan maks 5):`);
    users.forEach(user => {
      console.log(`      - ${user.id}: ${user.name} (${user.email}) - Role: ${user.role_id}`);
    });
    
    // Periksa prices
    console.log('   Memeriksa prices...');
    const [prices] = await sequelize.query('SELECT * FROM prices ORDER BY id LIMIT 5');
    console.log(`   ✅ Ditemukan ${prices.length} harga (menampilkan maks 5):`);
    prices.forEach(price => {
      console.log(`      - ${price.id}: Fuel Type ${price.fuel_type_id} - Rp ${price.price}`);
    });
    
    // Periksa sales
    console.log('   Memeriksa sales...');
    const [sales] = await sequelize.query('SELECT * FROM sales ORDER BY id LIMIT 3');
    console.log(`   ✅ Ditemukan ${sales.length} penjualan (menampilkan maks 3):`);
    sales.forEach(sale => {
      console.log(`      - ${sale.id}: ${sale.liters}L - Rp ${sale.amount}`);
    });
    
    console.log('\n🎉 Verifikasi data awal berhasil!');
    console.log('\n📊 Ringkasan:');
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Fuel Types: ${fuelTypes.length}`);
    console.log(`   - SPBU: ${spbus.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Prices: ${prices.length}`);
    console.log(`   - Sales: ${sales.length}`);
    
    console.log('\n🚀 Aplikasi siap untuk digunakan!');
    
  } catch (error) {
    console.error('❌ Verifikasi data gagal:', error.message);
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Periksa koneksi database');
    console.error('   2. Pastikan migrasi dan seed telah berhasil dijalankan');
  } finally {
    // Tutup koneksi
    try {
      await sequelize.close();
      console.log('\n🔒 Koneksi database ditutup');
    } catch (closeError) {
      console.error('⚠️  Gagal menutup koneksi database:', closeError.message);
    }
  }
}

// Jalankan verifikasi
verifyData();
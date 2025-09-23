// File untuk test koneksi database
const { connectDB } = require('./config/db');
const { sequelize } = require('./config/db');

async function testConnection() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    console.log('Database config:');
    console.log('- Host:', sequelize.config.host);
    console.log('- User:', sequelize.config.username);
    console.log('- Database:', sequelize.config.database);
    console.log('- Dialect:', sequelize.config.dialect);
    
    // Test koneksi
    await connectDB();
    console.log('✅ Database connection test PASSED');
    
    // Test query sederhana
    console.log('Testing simple query...');
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Simple query test PASSED');
    console.log('Current time from database:', result[0][0].current_time);
    
    // Test tabel yang ada
    console.log('Testing table existence...');
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('✅ Table existence test PASSED');
    console.log('Tables found:', tables.map(t => t.table_name));
    
    process.exit(0);
  } catch (error) {
    console.error('=== DATABASE CONNECTION TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error syscall:', error.syscall);
    if (error.hostname) {
      console.error('Error hostname:', error.hostname);
    }
    process.exit(1);
  }
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
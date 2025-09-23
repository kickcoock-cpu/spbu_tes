// File untuk test koneksi database
const { connectDB } = require('./config/db');

async function testConnection() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    await connectDB();
    console.log('✅ Database connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
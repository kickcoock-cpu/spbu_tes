// File test sederhana untuk memverifikasi fungsionalitas backend
const { sequelize, connectDB } = require('./config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('✅ Database connection test passed');
    
    // Test a simple query
    console.log('Testing simple query...');
    const result = await sequelize.query('SELECT 1 as test');
    console.log('✅ Simple query test passed:', result[0]);
    
    console.log('All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection();
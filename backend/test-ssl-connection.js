// Test database connection with updated SSL configuration
require('dotenv').config({ path: '.env.vercel' });
const { sequelize } = require('./config/supabase-db');

async function testConnection() {
  try {
    console.log('=== Testing Database Connection with Updated SSL Config ===');
    console.log('Environment variables:');
    console.log('- DB_HOST:', process.env.DB_HOST);
    console.log('- DB_USER:', process.env.DB_USER);
    console.log('- DB_NAME:', process.env.DB_NAME);
    console.log('- POSTGRES_URL present:', !!process.env.POSTGRES_URL);
    
    // Test connection
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('Testing simple query...');
    const result = await sequelize.query('SELECT NOW() as now');
    console.log('✅ Query test successful:', result[0][0]);
    
    await sequelize.close();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Error stack:', error.stack);
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }
  }
}

testConnection();
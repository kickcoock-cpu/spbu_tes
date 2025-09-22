// test-vercel-supabase.js
const { sequelize } = require('./config/db');

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT version()');
    console.log('Database version:', results[0].version);
    
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();
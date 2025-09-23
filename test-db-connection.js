const { Sequelize } = require('sequelize');

// Test database connection with the provided credentials
const sequelize = new Sequelize(
  'postgres',
  'postgres',
  'Pertamina1*',
  {
    host: 'db.eqwnpfuuwpdsacyvdrvj.supabase.co',
    port: 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    ssl: true
  }
);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
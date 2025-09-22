const { Sequelize } = require('sequelize');
require('dotenv').config();

// Test database configuration
const testSequelize = new Sequelize(
  process.env.TEST_DB_NAME || 'spbu_test_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Function to test connection to test database
const connectTestDB = async () => {
  try {
    await testSequelize.authenticate();
    console.log('✅ Test database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to test database:', error.message);
    return false;
  }
};

// Function to initialize test database (create tables, etc.)
const initTestDB = async () => {
  try {
    // Sync all models to test database
    await testSequelize.sync({ alter: true });
    console.log('✅ Test database models synchronized.');
    return true;
  } catch (error) {
    console.error('❌ Error synchronizing test database models:', error.message);
    return false;
  }
};

// Function to clean up test database
const cleanupTestDB = async () => {
  try {
    // Drop all tables
    await testSequelize.drop();
    console.log('✅ Test database cleaned up.');
    return true;
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error.message);
    return false;
  }
};

module.exports = {
  testSequelize,
  connectTestDB,
  initTestDB,
  cleanupTestDB
};
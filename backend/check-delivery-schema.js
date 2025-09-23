const { sequelize } = require('./config/db');
const { Delivery } = require('./models');

async function checkSchema() {
  try {
    // Get table info
    const tableInfo = await sequelize.getQueryInterface().describeTable('deliveries');
    console.log('Deliveries table schema:');
    console.log(tableInfo);
    
    // List all tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('\nAll tables:');
    console.log(tables);
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
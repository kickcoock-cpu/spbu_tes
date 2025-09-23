const { sequelize } = require('./config/db');

async function checkSalesSchema() {
  try {
    // Get table info
    const tableInfo = await sequelize.getQueryInterface().describeTable('sales');
    console.log('Sales table schema:');
    console.log(tableInfo);
  } catch (error) {
    console.error('Error checking sales schema:', error);
  } finally {
    await sequelize.close();
  }
}

checkSalesSchema();
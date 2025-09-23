const { sequelize } = require('./config/db');
const { Delivery, FuelType } = require('./models');

async function checkFuelTypes() {
  try {
    // Get fuel types table info
    const tableInfo = await sequelize.getQueryInterface().describeTable('fuel_types');
    console.log('Fuel types table schema:');
    console.log(tableInfo);
    
    // Get all fuel types
    const fuelTypes = await sequelize.query('SELECT * FROM fuel_types', { type: sequelize.QueryTypes.SELECT });
    console.log('\nFuel types data:');
    console.log(fuelTypes);
  } catch (error) {
    console.error('Error checking fuel types:', error);
  } finally {
    await sequelize.close();
  }
}

checkFuelTypes();
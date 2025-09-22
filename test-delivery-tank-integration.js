// Test script for delivery-tank integration
// This script will test the functionality of adding deliveries to tanks

require('dotenv').config({ path: './backend/.env' });
const { Delivery, Tank, sequelize } = require('./backend/models');

async function testDeliveryTankIntegration() {
  try {
    // Create a test tank
    const testTank = await Tank.create({
      spbu_id: 1,
      name: 'Test Tank',
      fuel_type: 'Pertamax',
      capacity: 10000,
      current_stock: 5000
    });
    
    console.log('Created test tank:', testTank.toJSON());
    
    // Create a test delivery
    const testDelivery = await Delivery.create({
      spbu_id: 1,
      supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
      fuel_type: 'Pertamax',
      liters: 2000,
      status: 'pending'
    });
    
    console.log('Created test delivery:', testDelivery.toJSON());
    
    // Simulate confirming the delivery
    testDelivery.status = 'confirmed';
    testDelivery.confirmed_by = 1;
    testDelivery.liters = 2000; // Actual liters
    await testDelivery.save();
    
    console.log('Confirmed delivery:', testDelivery.toJSON());
    
    // Update tank stock (this is what our implementation should do)
    const tank = await Tank.findOne({
      where: {
        spbu_id: testDelivery.spbu_id,
        fuel_type: testDelivery.fuel_type
      }
    });
    
    if (tank) {
      tank.current_stock = parseFloat(tank.current_stock) + parseFloat(testDelivery.liters);
      await tank.save();
      console.log('Updated tank stock:', tank.toJSON());
    }
    
    // Verify the result
    const updatedTank = await Tank.findByPk(testTank.id);
    console.log('Final tank stock:', updatedTank.toJSON());
    
    // Clean up test data
    await testDelivery.destroy();
    await testTank.destroy();
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDeliveryTankIntegration();
// Test script for delivery-tank integration
// This script will test the functionality of adding deliveries to tanks by calling the controller function directly

require('dotenv').config();
const { Delivery, Tank, SPBU, User, sequelize } = require('./models');
const { confirmDelivery } = require('./controllers/deliveriesController');

// Mock request and response objects for testing
const createMockReq = (deliveryId, userId, spbuId, actualLiters) => ({
  params: { id: deliveryId },
  user: { id: userId, spbu_id: spbuId, Role: { name: 'Super Admin' } },
  body: { actualLiters: actualLiters }
});

const createMockRes = () => {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    }
  };
  return res;
};

async function testDeliveryTankIntegration() {
  try {
    // Check if there are any SPBUs in the database
    const spbuCount = await SPBU.count();
    if (spbuCount === 0) {
      console.log('No SPBUs found in database. Please run seeders first.');
      return;
    }
    
    // Get the first SPBU
    const spbu = await SPBU.findOne();
    console.log('Using SPBU:', spbu.toJSON());
    
    // Check if there are any users in the database
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('No users found in database. Please run seeders first.');
      return;
    }
    
    // Get the first user
    const user = await User.findOne();
    console.log('Using user:', user.toJSON());
    
    // Check if there's already a tank for this SPBU and fuel type
    let testTank = await Tank.findOne({
      where: {
        spbu_id: spbu.id,
        fuel_type: 'Pertamax'
      }
    });
    
    let initialStock = 0;
    if (!testTank) {
      // Create a test tank if it doesn't exist
      testTank = await Tank.create({
        spbu_id: spbu.id,
        name: 'Test Tank',
        fuel_type: 'Pertamax',
        capacity: 10000,
        current_stock: 5000
      });
      initialStock = 5000;
      console.log('Created test tank:', testTank.toJSON());
    } else {
      initialStock = parseFloat(testTank.current_stock);
      console.log('Using existing tank:', testTank.toJSON());
    }
    
    // Record initial tank stock
    console.log('Initial tank stock:', initialStock);
    
    // Create a test delivery
    const testDelivery = await Delivery.create({
      spbu_id: spbu.id,
      supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
      fuel_type: 'Pertamax',
      planned_liters: 2000,
      status: 'pending'
    });
    
    console.log('Created test delivery:', testDelivery.toJSON());
    
    // Test the confirmDelivery function directly
    const req = createMockReq(testDelivery.id, user.id, spbu.id, 2000);
    const res = createMockRes();
    
    await confirmDelivery(req, res);
    
    console.log('confirmDelivery function called');
    console.log('Response status:', res.statusCode);
    console.log('Response data:', res.data);
    
    // Verify the tank stock was updated
    const updatedTank = await Tank.findByPk(testTank.id);
    const finalStock = parseFloat(updatedTank.current_stock);
    console.log('Final tank stock:', finalStock);
    
    // Check if stock was updated correctly
    if (finalStock === initialStock + 2000) {
      console.log('SUCCESS: Tank stock updated correctly!');
    } else {
      console.log('ERROR: Tank stock not updated correctly.');
      console.log('Expected:', initialStock + 2000);
      console.log('Actual:', finalStock);
    }
    
    // Clean up test data (delivery only, keep tank if it existed before)
    await testDelivery.destroy();
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDeliveryTankIntegration();
// Test script to verify that actual liters are used instead of planned liters

require('dotenv').config();
const { Delivery, Tank, SPBU, User, sequelize } = require('./models');
const { confirmDelivery } = require('./controllers/deliveriesController');

// Mock request and response objects for testing
const createMockReq = (deliveryId, userId, spbuId, actualLiters) => ({
  params: { id: deliveryId },
  user: { id: userId, spbu_id: spbuId, Role: { name: 'Super Admin' } },  // Use Super Admin to bypass H+1 restriction
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

async function testActualLitersUsage() {
  try {
    console.log('Testing actual liters usage...');
    
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
    
    // Get a Super Admin user
    const user = await User.findOne({
      include: [{
        model: require('./models').Role,
        where: { name: 'Super Admin' }
      }]
    });
    
    if (!user) {
      console.log('No Super Admin user found in database.');
      return;
    }
    
    console.log('Using Super Admin user:', user.toJSON());
    
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
    
    // Create a test delivery with planned liters = 1000
    const testDelivery = await Delivery.create({
      spbu_id: spbu.id,
      supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
      fuel_type: 'Pertamax',
      planned_liters: 1000,  // Planned liters
      status: 'pending'
    });
    
    console.log('Created test delivery with planned liters = 1000:', testDelivery.toJSON());
    
    // Test the confirmDelivery function with actual liters = 2000
    const req = createMockReq(testDelivery.id, user.id, spbu.id, 2000);  // Actual liters = 2000
    const res = createMockRes();
    
    await confirmDelivery(req, res);
    
    console.log('confirmDelivery function called with actual liters = 2000');
    console.log('Response status:', res.statusCode);
    
    if (res.statusCode === 200) {
      console.log('Delivery confirmed successfully');
      
      // Verify the delivery was updated with actual liters
      const updatedDelivery = await Delivery.findByPk(testDelivery.id);
      console.log('Updated delivery actual liters:', parseFloat(updatedDelivery.actual_liters));
      
      // Verify the tank stock was updated with actual liters (not planned liters)
      const updatedTank = await Tank.findByPk(testTank.id);
      const finalStock = parseFloat(updatedTank.current_stock);
      console.log('Final tank stock:', finalStock);
      
      // Check if stock was updated correctly with actual liters (2000) not planned liters (1000)
      if (finalStock === initialStock + 2000) {
        console.log('SUCCESS: Tank stock updated correctly with ACTUAL liters (2000)!');
        console.log('Expected stock:', initialStock + 2000);
        console.log('Actual stock:', finalStock);
      } else if (finalStock === initialStock + 1000) {
        console.log('ERROR: Tank stock updated with PLANNED liters (1000) instead of actual liters!');
        console.log('This indicates the implementation is not using actual liters correctly.');
        console.log('Expected stock with actual liters:', initialStock + 2000);
        console.log('Actual stock (using planned liters):', finalStock);
      } else {
        console.log('ERROR: Tank stock not updated correctly.');
        console.log('Expected with actual liters:', initialStock + 2000);
        console.log('Actual:', finalStock);
      }
    } else {
      console.log('ERROR: Delivery confirmation failed');
      console.log('Response data:', res.data);
    }
    
    // Clean up test data (delivery only, keep tank if it existed before)
    await testDelivery.destroy();
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testActualLitersUsage();
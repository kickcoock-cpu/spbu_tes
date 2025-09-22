// Test script to verify that only operators can confirm deliveries and process stops at confirmed status

require('dotenv').config();
const { Delivery, Tank, SPBU, User, sequelize } = require('./models');
const { confirmDelivery, approveDelivery } = require('./controllers/deliveriesController');

// Mock request and response objects for testing
const createMockReq = (deliveryId, userId, spbuId, actualLiters, roleName) => ({
  params: { id: deliveryId },
  user: { id: userId, spbu_id: spbuId, Role: { name: roleName } },
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

async function testOperatorOnlyConfirmation() {
  try {
    console.log('Testing that only operators can confirm deliveries and process stops at confirmed status...');
    
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
    
    // Get an operator user
    const operatorUser = await User.findOne({
      include: [{
        model: require('./models').Role,
        where: { name: 'Operator' }
      }]
    });
    
    if (!operatorUser) {
      console.log('No operator user found in database.');
      return;
    }
    
    console.log('Using operator user:', operatorUser.toJSON());
    
    // Get an admin user
    const adminUser = await User.findOne({
      include: [{
        model: require('./models').Role,
        where: { name: 'Admin' }
      }]
    });
    
    if (!adminUser) {
      console.log('No admin user found in database.');
      return;
    }
    
    console.log('Using admin user for testing access control.');
    
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
    // Set created_at to 2 days ago to bypass H+1 restriction
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const testDelivery = await Delivery.create({
      spbu_id: spbu.id,
      supplier: 'PT PERTAMINA PATRA NIAGA MADIUN',
      fuel_type: 'Pertamax',
      planned_liters: 1000,  // Planned liters
      status: 'pending',
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo
    });
    
    console.log('Created test delivery with planned liters = 1000 (created 2 days ago):', testDelivery.toJSON());
    
    // Test 1: Try to confirm delivery with admin user (should fail)
    console.log('\n--- Test 1: Admin trying to confirm delivery (should fail) ---');
    const adminReq = createMockReq(testDelivery.id, adminUser.id, spbu.id, 2000, 'Admin');
    const adminRes = createMockRes();
    
    await confirmDelivery(adminReq, adminRes);
    
    console.log('Admin confirmDelivery function called');
    console.log('Response status:', adminRes.statusCode);
    
    if (adminRes.statusCode === 403) {
      console.log('SUCCESS: Admin correctly denied access to confirm delivery');
    } else {
      console.log('ERROR: Admin should not be able to confirm delivery');
      console.log('Response data:', adminRes.data);
    }
    
    // Verify the delivery was not updated
    const deliveryAfterAdminAttempt = await Delivery.findByPk(testDelivery.id);
    console.log('Delivery status after admin attempt:', deliveryAfterAdminAttempt.status);
    
    // Test 2: Confirm delivery with operator user (should succeed)
    console.log('\n--- Test 2: Operator confirming delivery (should succeed) ---');
    const operatorReq = createMockReq(testDelivery.id, operatorUser.id, spbu.id, 2000, 'Operator');
    const operatorRes = createMockRes();
    
    await confirmDelivery(operatorReq, operatorRes);
    
    console.log('Operator confirmDelivery function called with actual liters = 2000');
    console.log('Response status:', operatorRes.statusCode);
    
    if (operatorRes.statusCode === 200) {
      console.log('SUCCESS: Operator confirmed delivery successfully');
      
      // Verify the delivery was updated with actual liters
      const updatedDelivery = await Delivery.findByPk(testDelivery.id);
      console.log('Updated delivery status:', updatedDelivery.status);
      console.log('Updated delivery actual liters:', parseFloat(updatedDelivery.actual_liters));
      console.log('Confirmed by user ID:', updatedDelivery.confirmed_by);
      
      // Verify the tank stock was updated with actual liters
      const updatedTank = await Tank.findByPk(testTank.id);
      const finalStock = parseFloat(updatedTank.current_stock);
      console.log('Final tank stock:', finalStock);
      
      // Check if stock was updated correctly with actual liters (2000) not planned liters (1000)
      if (finalStock === initialStock + 2000) {
        console.log('SUCCESS: Tank stock updated correctly with ACTUAL liters (2000)!');
        console.log('Expected stock:', initialStock + 2000);
        console.log('Actual stock:', finalStock);
      } else {
        console.log('ERROR: Tank stock not updated correctly.');
        console.log('Expected with actual liters:', initialStock + 2000);
        console.log('Actual:', finalStock);
      }
      
      // Test 3: Try to approve delivery (should fail as endpoint is deprecated)
      console.log('\n--- Test 3: Trying to approve delivery (should fail as deprecated) ---');
      const approveRes = createMockRes();
      await approveDelivery(operatorReq, approveRes);
      
      console.log('approveDelivery function called');
      console.log('Response status:', approveRes.statusCode);
      
      if (approveRes.statusCode === 400) {
        console.log('SUCCESS: Approve endpoint correctly deprecated');
      } else {
        console.log('ERROR: Approve endpoint should be deprecated');
        console.log('Response data:', approveRes.data);
      }
    } else {
      console.log('ERROR: Operator failed to confirm delivery');
      console.log('Response data:', operatorRes.data);
    }
    
    // Clean up test data (delivery only, keep tank if it existed before)
    await testDelivery.destroy();
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testOperatorOnlyConfirmation();
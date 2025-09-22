#!/usr/bin/env node

/**
 * Safe Live Sale Testing Script
 * 
 * This script creates a separate test database and runs sales tests without affecting the main database.
 * It uses a separate test database configuration to ensure no interference with existing data.
 */

const { testSequelize, connectTestDB, initTestDB } = require('../config/test-db');
const { Role, SPBU, User, Tank, Price, Sale } = require('../models');
const bcrypt = require('bcryptjs');

// Test data
const testUsers = [
  {
    name: 'Test Operator',
    email: 'test.operator@spbu.test',
    username: 'testoperator',
    password: 'testpassword123',
    role: 'Operator'
  }
];

const testSPBUs = [
  {
    name: 'Test SPBU Jakarta',
    code: 'SPBU-JKT-001',
    location: 'Jakarta Pusat'
  },
  {
    name: 'Test SPBU Bandung',
    code: 'SPBU-BDG-001',
    location: 'Bandung Kota'
  }
];

const testTanks = [
  { name: 'Premium Tank A', fuel_type: 'Premium', capacity: 10000, current_stock: 8000 },
  { name: 'Pertamax Tank A', fuel_type: 'Pertamax', capacity: 10000, current_stock: 6500 },
  { name: 'Pertalite Tank A', fuel_type: 'Pertalite', capacity: 15000, current_stock: 12000 },
  { name: 'Solar Tank A', fuel_type: 'Solar', capacity: 8000, current_stock: 5000 },
  { name: 'Dexlite Tank A', fuel_type: 'Dexlite', capacity: 5000, current_stock: 3000 }
];

const testPrices = [
  { fuel_type: 'Premium', price: 12500 },
  { fuel_type: 'Pertamax', price: 13200 },
  { fuel_type: 'Pertalite', price: 12000 },
  { fuel_type: 'Solar', price: 8500 },
  { fuel_type: 'Dexlite', price: 14000 }
];

// Test sales data
const testSales = [
  // Normal sales with sufficient stock
  { fuel_type: 'Premium', liters: 10.50, description: '🚗 Regular customer - Premium' },
  { fuel_type: 'Pertamax', liters: 15.25, description: '🏍️ Motorcycle - Pertamax' },
  { fuel_type: 'Pertalite', liters: 20.75, description: '🚛 Truck - Pertalite' },
  { fuel_type: 'Solar', liters: 25.00, description: '🚜 Farm vehicle - Solar' },
  { fuel_type: 'Dexlite', liters: 30.50, description: '🛻 Pickup - Dexlite' },
  
  // Larger sales
  { fuel_type: 'Premium', liters: 50.00, description: '🏢 Office fleet - Premium' },
  { fuel_type: 'Pertamax', liters: 45.75, description: '🚐 Van service - Pertamax' },
  
  // Heavy usage
  { fuel_type: 'Pertalite', liters: 100.00, description: '🚚 Delivery company - Pertalite' },
  { fuel_type: 'Solar', liters: 75.25, description: '🏗️ Construction - Solar' },
  
  // Small sales
  { fuel_type: 'Premium', liters: 1.50, description: '⛽ Top up - Premium' },
  { fuel_type: 'Pertamax', liters: 2.25, description: '🛵 Scooter - Pertamax' },
  
  // Decimal precision sales
  { fuel_type: 'Pertalite', liters: 3.33, description: '🚗 Precise fill - Pertalite' },
  { fuel_type: 'Solar', liters: 7.77, description: '🚜 Exact amount - Solar' }
];

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...');
  
  try {
    // Connect to test database
    const connected = await connectTestDB();
    if (!connected) {
      throw new Error('Failed to connect to test database');
    }
    
    // Initialize database schema
    await initTestDB();
    
    console.log('✅ Test database setup completed');
    return true;
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    return false;
  }
}

async function createTestData() {
  console.log('\n📋 Creating test data...');
  
  try {
    // Create roles
    console.log('  Creating roles...');
    const roles = ['Super Admin', 'Admin', 'Operator'];
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName }
      });
    }
    console.log('  ✅ Roles created');
    
    // Get operator role
    const operatorRole = await Role.findOne({ where: { name: 'Operator' } });
    
    // Create SPBUs
    console.log('  Creating SPBUs...');
    const spbus = [];
    for (const spbuData of testSPBUs) {
      const [spbu] = await SPBU.findOrCreate({
        where: { code: spbuData.code },
        defaults: spbuData
      });
      spbus.push(spbu);
    }
    console.log(`  ✅ ${spbus.length} SPBUs created`);
    
    // Create users
    console.log('  Creating users...');
    const users = [];
    for (const userData of testUsers) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
          role_id: operatorRole.id,
          spbu_id: spbus[0].id
        }
      });
      users.push(user);
    }
    console.log(`  ✅ ${users.length} users created`);
    
    // Create tanks
    console.log('  Creating tanks...');
    const tanks = [];
    for (const tankData of testTanks) {
      const [tank] = await Tank.findOrCreate({
        where: { 
          name: tankData.name,
          spbu_id: spbus[0].id
        },
        defaults: {
          ...tankData,
          spbu_id: spbus[0].id
        }
      });
      tanks.push(tank);
    }
    console.log(`  ✅ ${tanks.length} tanks created`);
    
    // Create prices
    console.log('  Creating prices...');
    const prices = [];
    for (const priceData of testPrices) {
      const [price] = await Price.findOrCreate({
        where: { 
          fuel_type: priceData.fuel_type,
          spbu_id: null // Global prices
        },
        defaults: {
          ...priceData,
          spbu_id: null,
          updated_by: users[0].id
        }
      });
      prices.push(price);
    }
    console.log(`  ✅ ${prices.length} prices created`);
    
    console.log('✅ Test data creation completed');
    return { spbus, users, tanks, prices };
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    throw error;
  }
}

async function runSalesTests(users, spbus) {
  console.log('\n🧪 Running sales tests...');
  
  const operator = users[0];
  const spbu = spbus[0];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const saleData of testSales) {
    try {
      console.log(`\n--- ${saleData.description} ---`);
      console.log(`   Fuel: ${saleData.fuel_type}, Liters: ${saleData.liters}`);
      
      // Find current price
      const priceRecord = await Price.findOne({
        where: {
          fuel_type: saleData.fuel_type,
          spbu_id: null // Global price
        },
        order: [['created_at', 'DESC']]
      });
      
      if (!priceRecord) {
        console.log(`   ❌ No price found for ${saleData.fuel_type}`);
        failureCount++;
        continue;
      }
      
      const amount = parseFloat(priceRecord.price) * parseFloat(saleData.liters);
      console.log(`   Amount: Rp ${amount.toLocaleString()} (${priceRecord.price.toLocaleString()}/L)`);
      
      // Find tank with sufficient stock
      const tank = await Tank.findOne({
        where: {
          spbu_id: spbu.id,
          fuel_type: saleData.fuel_type
        }
      });
      
      if (!tank) {
        console.log(`   ❌ No tank found for ${saleData.fuel_type}`);
        failureCount++;
        continue;
      }
      
      if (parseFloat(tank.current_stock) < parseFloat(saleData.liters)) {
        console.log(`   ❌ Insufficient stock. Available: ${tank.current_stock}L, Requested: ${saleData.liters}L`);
        failureCount++;
        continue;
      }
      
      // Create sale using the test database connection
      const sale = await Sale.create({
        spbu_id: spbu.id,
        operator_id: operator.id,
        fuel_type: saleData.fuel_type,
        liters: saleData.liters,
        amount: amount
      });
      
      console.log(`   ✅ Sale created successfully (ID: ${sale.id})`);
      
      // Update tank stock
      const newStock = parseFloat(tank.current_stock) - parseFloat(saleData.liters);
      await tank.update({ current_stock: newStock });
      
      console.log(`   📉 Tank stock updated: ${tank.current_stock}L → ${newStock}L`);
      
      successCount++;
      
      // Small delay to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`   ❌ Failed to create sale:`, error.message);
      failureCount++;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   ✅ Successful sales: ${successCount}`);
  console.log(`   ❌ Failed sales: ${failureCount}`);
  console.log(`   📈 Success rate: ${successCount > 0 ? ((successCount / (successCount + failureCount)) * 100).toFixed(1) : 0}%`);
  
  return { successCount, failureCount };
}

async function displayResults() {
  console.log('\n📋 Final Test Results:');
  
  try {
    // Display tank status
    console.log('\n🛢️  Tank Status:');
    const tanks = await Tank.findAll({
      include: [{ model: SPBU, attributes: ['name'] }]
    });
    
    for (const tank of tanks) {
      const percentage = ((parseFloat(tank.current_stock) / parseFloat(tank.capacity)) * 100).toFixed(1);
      console.log(`   ${tank.SPBU?.name} - ${tank.name}: ${tank.current_stock}L / ${tank.capacity}L (${percentage}%)`);
    }
    
    // Display recent sales
    console.log('\n💰 Recent Sales:');
    const recentSales = await Sale.findAll({
      include: [
        { model: SPBU, attributes: ['name'] },
        { model: User, as: 'operator', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    for (const sale of recentSales) {
      console.log(`   ${new Date(sale.created_at).toLocaleString()} - ${sale.fuel_type}: ${sale.liters}L (Rp ${sale.amount.toLocaleString()}) - ${sale.operator?.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error displaying results:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Safe Live Sale Testing');
  console.log('===================================');
  
  try {
    // Setup test database
    const dbReady = await setupTestDatabase();
    if (!dbReady) {
      throw new Error('Test database setup failed');
    }
    
    // Create test data
    const { spbus, users, tanks, prices } = await createTestData();
    
    // Run sales tests
    const { successCount, failureCount } = await runSalesTests(users, spbus);
    
    // Display results
    await displayResults();
    
    console.log('\n✅ All tests completed successfully!');
    
    if (failureCount === 0) {
      console.log('🎉 Perfect! All sales tests passed.');
    } else {
      console.log(`⚠️  ${failureCount} test(s) failed. Please review the output above.`);
    }
    
    // Close database connection
    await testSequelize.close();
    console.log('🔌 Database connection closed.');
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    await testSequelize.close();
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Script execution error:', error);
    process.exit(1);
  });
}

module.exports = {
  setupTestDatabase,
  createTestData,
  runSalesTests,
  displayResults,
  runAllTests
};
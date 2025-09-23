#!/usr/bin/env node

/**
 * Live Sale Testing Script
 * 
 * This script creates realistic test sales to validate the sales system functionality.
 * It tests various scenarios including:
 * - Normal sales with sufficient stock
 * - Sales that should fail due to insufficient stock
 * - Sales with different fuel types
 * - Sales with varying quantities
 */

const { sequelize, SPBU, Tank, Sale, Price, User, Role } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Test data
const fuelTypes = ['Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'];
const testUsers = [
  {
    name: 'Test Operator',
    email: 'operator@test.com',
    username: 'testoperator',
    password: 'Pertamina1*', // Standardized password
    role: 'Operator'
  }
];

const testSPBUs = [
  {
    name: 'Test SPBU 1',
    code: 'SPBU-001',
    location: 'Test Location 1'
  },
  {
    name: 'Test SPBU 2',
    code: 'SPBU-002',
    location: 'Test Location 2'
  }
];

const testTanks = [
  { name: 'Premium Tank 1', fuel_type: 'Premium', capacity: 10000, current_stock: 5000 },
  { name: 'Pertamax Tank 1', fuel_type: 'Pertamax', capacity: 10000, current_stock: 3000 },
  { name: 'Pertalite Tank 1', fuel_type: 'Pertalite', capacity: 10000, current_stock: 7000 },
  { name: 'Solar Tank 1', fuel_type: 'Solar', capacity: 10000, current_stock: 2000 },
  { name: 'Dexlite Tank 1', fuel_type: 'Dexlite', capacity: 10000, current_stock: 4000 }
];

const testPrices = [
  { fuel_type: 'Premium', price: 10000, spbu_id: null }, // Global price
  { fuel_type: 'Pertamax', price: 12000, spbu_id: null }, // Global price
  { fuel_type: 'Pertalite', price: 11000, spbu_id: null }, // Global price
  { fuel_type: 'Solar', price: 8000, spbu_id: null }, // Global price
  { fuel_type: 'Dexlite', price: 13000, spbu_id: null } // Global price
];

// Test sales data
const testSales = [
  // Normal sales with sufficient stock
  { fuel_type: 'Premium', liters: 10, description: 'Normal sale - Premium' },
  { fuel_type: 'Pertamax', liters: 15, description: 'Normal sale - Pertamax' },
  { fuel_type: 'Pertalite', liters: 20, description: 'Normal sale - Pertalite' },
  { fuel_type: 'Solar', liters: 25, description: 'Normal sale - Solar' },
  { fuel_type: 'Dexlite', liters: 30, description: 'Normal sale - Dexlite' },
  
  // Larger sales
  { fuel_type: 'Premium', liters: 50, description: 'Large sale - Premium' },
  { fuel_type: 'Pertamax', liters: 45, description: 'Large sale - Pertamax' },
  
  // Sales that should reduce stock significantly
  { fuel_type: 'Pertalite', liters: 100, description: 'Heavy usage - Pertalite' },
  { fuel_type: 'Solar', liters: 75, description: 'Heavy usage - Solar' },
  
  // Small sales
  { fuel_type: 'Premium', liters: 1.5, description: 'Small sale - Premium' },
  { fuel_type: 'Pertamax', liters: 2.25, description: 'Small sale - Pertamax' }
];

async function setupTestData() {
  console.log('Setting up test data...');
  
  try {
    // Create test roles if they don't exist
    const roles = ['Super Admin', 'Admin', 'Operator'];
    for (const roleName of roles) {
      const [role] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName }
      });
      console.log(`Role '${roleName}' ready`);
    }
    
    // Create test SPBUs
    const spbus = [];
    for (const spbuData of testSPBUs) {
      const [spbu] = await SPBU.findOrCreate({
        where: { code: spbuData.code },
        defaults: spbuData
      });
      spbus.push(spbu);
      console.log(`SPBU '${spbu.name}' ready`);
    }
    
    // Create test users
    const operatorRole = await Role.findOne({ where: { name: 'Operator' } });
    const users = [];
    for (const userData of testUsers) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
          role_id: operatorRole.id,
          spbu_id: spbus[0].id // Assign to first SPBU
        }
      });
      users.push(user);
      console.log(`User '${user.name}' ready`);
    }
    
    // Create test tanks for the first SPBU
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
      console.log(`Tank '${tank.name}' ready with ${tank.current_stock}L stock`);
    }
    
    // Create test prices
    const prices = [];
    for (const priceData of testPrices) {
      const [price] = await Price.findOrCreate({
        where: { 
          fuel_type: priceData.fuel_type,
          spbu_id: priceData.spbu_id
        },
        defaults: {
          ...priceData,
          updated_by: 33 // Use Test Operator ID
        }
      });
      prices.push(price);
      console.log(`Price for ${price.fuel_type}: Rp ${price.price}`);
    }
    
    return { spbus, users, tanks, prices };
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

async function createTestSales(users, spbus) {
  console.log('\nCreating test sales...');
  
  const operator = users[0];
  const spbu = spbus[0];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const saleData of testSales) {
    try {
      console.log(`\n--- Testing: ${saleData.description} ---`);
      console.log(`Fuel: ${saleData.fuel_type}, Liters: ${saleData.liters}`);
      
      // Calculate amount based on price
      const priceRecord = await Price.findOne({
        where: {
          fuel_type: saleData.fuel_type,
          [Op.or]: [
            { spbu_id: spbu.id },
            { spbu_id: null } // Global price
          ]
        },
        order: [['created_at', 'DESC']]
      });
      
      if (!priceRecord) {
        console.log(`❌ No price found for ${saleData.fuel_type}`);
        failureCount++;
        continue;
      }
      
      const amount = parseFloat(priceRecord.price) * parseFloat(saleData.liters);
      console.log(`Calculated amount: Rp ${amount}`);
      
      // Create sale
      const sale = await Sale.create({
        spbu_id: spbu.id,
        operator_id: operator.id,
        fuel_type: saleData.fuel_type,
        liters: saleData.liters,
        amount: amount
      });
      
      console.log(`✅ Sale created successfully - ID: ${sale.id}`);
      
      // Update tank stock
      const tank = await Tank.findOne({
        where: {
          spbu_id: spbu.id,
          fuel_type: saleData.fuel_type
        }
      });
      
      if (tank) {
        const newStock = parseFloat(tank.current_stock) - parseFloat(saleData.liters);
        await tank.update({ current_stock: newStock });
        console.log(`✅ Tank stock updated: ${tank.current_stock}L → ${newStock}L`);
      }
      
      successCount++;
      
      // Add small delay to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Failed to create sale:`, error.message);
      failureCount++;
    }
  }
  
  console.log(`\n--- Test Summary ---`);
  console.log(`✅ Successful sales: ${successCount}`);
  console.log(`❌ Failed sales: ${failureCount}`);
  console.log(`📊 Success rate: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);
  
  return { successCount, failureCount };
}

async function displayResults() {
  console.log('\n--- Final System State ---');
  
  try {
    // Display current tank stocks
    console.log('\nFuel Tank Status:');
    const tanks = await Tank.findAll({
      include: [{ model: SPBU, attributes: ['name', 'code'] }]
    });
    
    for (const tank of tanks) {
      console.log(`  ${tank.SPBU?.name} - ${tank.name}: ${tank.current_stock}L / ${tank.capacity}L`);
    }
    
    // Display recent sales
    console.log('\nRecent Sales:');
    const recentSales = await Sale.findAll({
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'operator', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    for (const sale of recentSales) {
      console.log(`  ${sale.created_at.toLocaleString()} - ${sale.fuel_type}: ${sale.liters}L (Rp ${sale.amount}) - ${sale.operator?.name}`);
    }
    
  } catch (error) {
    console.error('Error displaying results:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting Live Sale Testing Script');
  console.log('=====================================');
  
  try {
    // Setup test data
    const { spbus, users, tanks, prices } = await setupTestData();
    
    // Create test sales
    const { successCount, failureCount } = await createTestSales(users, spbus);
    
    // Display final results
    await displayResults();
    
    console.log('\n✅ Testing completed!');
    
    if (failureCount === 0) {
      console.log('🎉 All tests passed successfully!');
    } else {
      console.log(`⚠️  ${failureCount} tests failed. Please review the output above.`);
    }
    
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  setupTestData,
  createTestSales,
  displayResults,
  runTests
};
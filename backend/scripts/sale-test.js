#!/usr/bin/env node

/**
 * Simple Sale API Test Script
 * 
 * This script tests the sales API endpoints directly to validate functionality.
 * It can be used to create test sales and verify the system behavior.
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');

// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Adjust to your backend URL
const TEST_OPERATOR = {
  email: 'operator@test.com',
  password: 'password123'
};

// Test sales data
const testSales = [
  { fuel_type: 'Premium', liters: 10.5, description: 'Test sale - Premium' },
  { fuel_type: 'Pertamax', liters: 15.25, description: 'Test sale - Pertamax' },
  { fuel_type: 'Pertalite', liters: 20.75, description: 'Test sale - Pertalite' },
  { fuel_type: 'Solar', liters: 25.0, description: 'Test sale - Solar' },
  { fuel_type: 'Dexlite', liters: 30.5, description: 'Test sale - Dexlite' }
];

let authToken = null;

// Helper function to make authenticated requests
async function authenticatedRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error(`Network Error: ${error.message}`);
    }
  }
}

// Login function
async function login() {
  console.log('🔐 Logging in as test operator...');
  try {
    const response = await authenticatedRequest('POST', '/api/users/login', {
      email: TEST_OPERATOR.email,
      password: TEST_OPERATOR.password
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Get current user info
async function getCurrentUser() {
  console.log('👤 Getting current user info...');
  try {
    const response = await authenticatedRequest('GET', '/api/users/me');
    console.log(`✅ Current user: ${response.data.name} (${response.data.email})`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get user info:', error.message);
    throw error;
  }
}

// Get tanks
async function getTanks() {
  console.log('🛢️  Getting tank information...');
  try {
    const response = await authenticatedRequest('GET', '/api/tanks');
    console.log(`✅ Found ${response.data.length} tanks`);
    
    response.data.forEach(tank => {
      console.log(`  - ${tank.name} (${tank.fuel_type}): ${tank.current_stock}L / ${tank.capacity}L`);
      if (tank.current_price) {
        console.log(`    Price: Rp ${tank.current_price}`);
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get tanks:', error.message);
    throw error;
  }
}

// Create a sale
async function createSale(saleData) {
  console.log(`\n🛒 Creating sale: ${saleData.description}`);
  console.log(`   Fuel: ${saleData.fuel_type}, Liters: ${saleData.liters}`);
  
  try {
    // Get current price for this fuel type
    const tanks = await getTanks();
    const matchingTank = tanks.find(tank => tank.fuel_type === saleData.fuel_type);
    
    if (!matchingTank) {
      throw new Error(`No tank found for fuel type: ${saleData.fuel_type}`);
    }
    
    if (matchingTank.current_stock < saleData.liters) {
      throw new Error(`Insufficient stock. Available: ${matchingTank.current_stock}L, Requested: ${saleData.liters}L`);
    }
    
    // Calculate amount (in real app, this would come from price API)
    const price = matchingTank.current_price || 10000; // Default price if not available
    const amount = price * saleData.liters;
    
    console.log(`   Calculated amount: Rp ${amount} (${price}/L)`);
    
    // Create the sale
    const salePayload = {
      fuel_type: saleData.fuel_type,
      liters: saleData.liters,
      amount: amount
    };
    
    const response = await authenticatedRequest('POST', '/api/sales', salePayload);
    
    console.log(`✅ Sale created successfully!`);
    console.log(`   Sale ID: ${response.data.id}`);
    console.log(`   Amount: Rp ${response.data.amount}`);
    console.log(`   Date: ${new Date(response.data.created_at).toLocaleString()}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create sale:`, error.message);
    throw error;
  }
}

// Get all sales
async function getSales() {
  console.log('\n📋 Getting all sales...');
  try {
    const response = await authenticatedRequest('GET', '/api/sales');
    console.log(`✅ Found ${response.data.length} sales`);
    
    // Show last 5 sales
    const recentSales = response.data.slice(-5);
    recentSales.forEach(sale => {
      console.log(`  - ${new Date(sale.transaction_date).toLocaleString()}: ${sale.fuel_type} ${sale.liters}L (Rp ${sale.amount})`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get sales:', error.message);
    throw error;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Sale API Test Script');
  console.log('================================');
  
  try {
    // Login
    await login();
    
    // Get user info
    const user = await getCurrentUser();
    console.log(`🏢 Assigned SPBU: ${user.spbu_id || 'Not assigned'}`);
    
    // Get tanks
    const tanks = await getTanks();
    
    // Create test sales
    console.log('\n🧪 Running sale tests...');
    let successCount = 0;
    let failureCount = 0;
    
    for (const saleData of testSales) {
      try {
        await createSale(saleData);
        successCount++;
        
        // Small delay between sales
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failureCount++;
        console.log(`   Skipping remaining tests due to error...`);
        break;
      }
    }
    
    // Show final results
    console.log('\n📊 Test Results:');
    console.log(`   Successful sales: ${successCount}`);
    console.log(`   Failed sales: ${failureCount}`);
    
    if (successCount > 0) {
      await getSales();
      await getTanks(); // Show updated tank stocks
    }
    
    console.log('\n✅ Test script completed!');
    
  } catch (error) {
    console.error('\n💥 Test script failed:', error.message);
    process.exit(1);
  }
}

// Test insufficient stock scenario
async function testInsufficientStock() {
  console.log('\n🧪 Testing insufficient stock scenario...');
  
  try {
    const tanks = await getTanks();
    
    // Try to create a sale with more liters than available stock
    if (tanks.length > 0) {
      const tank = tanks[0];
      const excessiveLiters = parseFloat(tank.current_stock) + 1000; // Definitely more than available
      
      console.log(`   Attempting to sell ${excessiveLiters}L of ${tank.fuel_type} (stock: ${tank.current_stock}L)`);
      
      const saleData = {
        fuel_type: tank.fuel_type,
        liters: excessiveLiters,
        description: 'Test insufficient stock'
      };
      
      try {
        await createSale(saleData);
        console.log('❌ This should have failed but didn\'t!');
      } catch (error) {
        console.log('✅ Correctly rejected sale due to insufficient stock');
      }
    }
  } catch (error) {
    console.error('Error in insufficient stock test:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--insufficient-stock')) {
    await login();
    await testInsufficientStock();
  } else if (args.includes('--help') || args.length === 0) {
    console.log(`
Sale API Test Script
====================

Usage:
  node sale-test.js                    Run all tests
  node sale-test.js --insufficient-stock  Test insufficient stock handling
  node sale-test.js --help            Show this help

Description:
  This script tests the sales API endpoints to verify functionality.
  It creates test sales and checks system behavior.
    `);
  } else {
    await runAllTests();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  login,
  getCurrentUser,
  getTanks,
  createSale,
  getSales,
  runAllTests,
  testInsufficientStock
};
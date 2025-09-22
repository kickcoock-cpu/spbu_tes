#!/usr/bin/env node

/**
 * Continuous Live Sale Script
 * 
 * This script creates continuous sales at regular intervals to simulate
 * real-world usage of the fuel sales system.
 */

const { sequelize, SPBU, Tank, Sale, Price, User, Role } = require('../models');
const { Op } = require('sequelize');

// Configuration
const INTERVAL_SECONDS = 30; // Create a sale every 30 seconds
const FUEL_TYPES = ['Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'];
const LITER_RANGES = {
  'Premium': { min: 5, max: 50 },
  'Pertamax': { min: 5, max: 50 },
  'Pertalite': { min: 5, max: 50 },
  'Solar': { min: 10, max: 100 },
  'Dexlite': { min: 5, max: 50 }
};

let saleCounter = 0;
let running = true;

// Get a random fuel type
function getRandomFuelType() {
  const randomIndex = Math.floor(Math.random() * FUEL_TYPES.length);
  return FUEL_TYPES[randomIndex];
}

// Get a random liter amount for a fuel type
function getRandomLiters(fuelType) {
  const range = LITER_RANGES[fuelType] || { min: 5, max: 50 };
  return (Math.random() * (range.max - range.min) + range.min).toFixed(2);
}

// Get test user
async function getTestUser() {
  try {
    const user = await User.findOne({
      where: { email: 'operator@test.com' }
    });
    
    if (!user) {
      throw new Error('Test operator user not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting test user:', error.message);
    throw error;
  }
}

// Get SPBU
async function getSPBU() {
  try {
    const spbu = await SPBU.findOne({
      where: { code: 'SPBU-001' }
    });
    
    if (!spbu) {
      // Try to get any SPBU
      const spbu = await SPBU.findOne();
      if (!spbu) {
        throw new Error('No SPBU found');
      }
    }
    
    return spbu;
  } catch (error) {
    console.error('Error getting SPBU:', error.message);
    throw error;
  }
}

// Get price for fuel type
async function getPrice(fuelType, spbuId) {
  try {
    const priceRecord = await Price.findOne({
      where: {
        fuel_type: fuelType,
        [Op.or]: [
          { spbu_id: spbuId },
          { spbu_id: null } // Global price
        ]
      },
      order: [['created_at', 'DESC']]
    });
    
    return priceRecord;
  } catch (error) {
    console.error('Error getting price:', error.message);
    return null;
  }
}

// Get tank for fuel type
async function getTank(fuelType, spbuId) {
  try {
    const tank = await Tank.findOne({
      where: {
        fuel_type: fuelType,
        spbu_id: spbuId
      }
    });
    
    return tank;
  } catch (error) {
    console.error('Error getting tank:', error.message);
    return null;
  }
}

// Create a sale
async function createSale() {
  try {
    console.log(`\n--- Creating Sale #${++saleCounter} ---`);
    
    // Get required data
    const user = await getTestUser();
    const spbu = await getSPBU();
    
    // Select random fuel type and liters
    const fuelType = getRandomFuelType();
    const liters = getRandomLiters(fuelType);
    
    console.log(`Fuel: ${fuelType}, Liters: ${liters}`);
    
    // Get price
    const priceRecord = await getPrice(fuelType, spbu.id);
    if (!priceRecord) {
      console.log(`❌ No price found for ${fuelType}`);
      return;
    }
    
    const amount = parseFloat(priceRecord.price) * parseFloat(liters);
    console.log(`Calculated amount: Rp ${amount.toLocaleString()}`);
    
    // Check tank stock
    const tank = await getTank(fuelType, spbu.id);
    if (!tank) {
      console.log(`❌ No tank found for ${fuelType}`);
      return;
    }
    
    if (parseFloat(tank.current_stock) < parseFloat(liters)) {
      console.log(`❌ Insufficient stock. Available: ${tank.current_stock}L, Requested: ${liters}L`);
      return;
    }
    
    // Create sale
    const sale = await Sale.create({
      spbu_id: spbu.id,
      operator_id: user.id,
      fuel_type: fuelType,
      liters: liters,
      amount: amount
    });
    
    console.log(`✅ Sale created successfully - ID: ${sale.id}`);
    
    // Update tank stock
    const newStock = parseFloat(tank.current_stock) - parseFloat(liters);
    await tank.update({ current_stock: newStock });
    console.log(`✅ Tank stock updated: ${tank.current_stock}L → ${newStock.toFixed(2)}L`);
    
  } catch (error) {
    console.log(`❌ Failed to create sale:`, error.message);
  }
}

// Show current status
async function showStatus() {
  try {
    console.log('\n--- System Status ---');
    
    // Show recent sales
    const recentSales = await Sale.findAll({
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'operator', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    console.log('Recent Sales:');
    for (const sale of recentSales) {
      console.log(`  ${sale.created_at.toLocaleString()} - ${sale.fuel_type}: ${sale.liters}L (Rp ${sale.amount.toLocaleString()}) - ${sale.operator?.name}`);
    }
    
    // Show tank status
    console.log('\nFuel Tank Status:');
    const tanks = await Tank.findAll({
      include: [{ model: SPBU, attributes: ['name', 'code'] }]
    });
    
    for (const tank of tanks) {
      const percentage = ((parseFloat(tank.current_stock) / parseFloat(tank.capacity)) * 100).toFixed(1);
      console.log(`  ${tank.SPBU?.name} - ${tank.name}: ${parseFloat(tank.current_stock).toFixed(2)}L / ${parseFloat(tank.capacity).toFixed(2)}L (${percentage}%)`);
    }
    
  } catch (error) {
    console.error('Error showing status:', error.message);
  }
}

// Graceful shutdown
function shutdown() {
  console.log('\n🛑 Shutting down continuous sale script...');
  running = false;
  process.exit(0);
}

// Main continuous loop
async function runContinuousSales() {
  console.log('🚀 Starting Continuous Live Sale Script');
  console.log('=====================================');
  console.log(`Creating sales every ${INTERVAL_SECONDS} seconds`);
  console.log('Press Ctrl+C to stop\n');
  
  // Show initial status
  await showStatus();
  
  // Set up interval for creating sales
  const saleInterval = setInterval(async () => {
    if (running) {
      await createSale();
    }
  }, INTERVAL_SECONDS * 1000);
  
  // Set up interval for showing status every 5 minutes
  const statusInterval = setInterval(async () => {
    if (running) {
      await showStatus();
    }
  }, 5 * 60 * 1000);
  
  // Handle graceful shutdown
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  
  console.log('✅ Continuous sale script is now running...');
  console.log(`Next sale in ${INTERVAL_SECONDS} seconds...\n`);
}

// Run the continuous sales
runContinuousSales().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
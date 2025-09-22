// Minimal test to isolate the issue
console.log('Testing individual components...');

// Test 1: Import express router
try {
  const express = require('express');
  const router = express.Router();
  console.log('✓ Express router created successfully');
} catch (error) {
  console.log('✗ Error creating express router:', error.message);
}

// Test 2: Import multer
try {
  const multer = require('multer');
  console.log('✓ Multer imported successfully');
} catch (error) {
  console.log('✗ Error importing multer:', error.message);
}

// Test 3: Import auth middleware
try {
  const { protect, authorize } = require('./middleware/auth');
  console.log('✓ Auth middleware imported successfully');
} catch (error) {
  console.log('✗ Error importing auth middleware:', error.message);
}

// Test 4: Import deliveries controller
try {
  const deliveriesController = require('./controllers/deliveriesController');
  console.log('✓ Deliveries controller imported successfully');
} catch (error) {
  console.log('✗ Error importing deliveries controller:', error.message);
  console.error(error.stack);
}

console.log('Test complete.');
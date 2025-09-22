// simple-test.js
console.log('Starting simple test...');

// Try to load just the deliveries route
try {
  console.log('Loading express...');
  const express = require('express');
  console.log('Express loaded');
  
  console.log('Creating router...');
  const router = express.Router();
  console.log('Router created');
  
  console.log('Loading deliveries route...');
  const deliveriesRoute = require('./routes/deliveries');
  console.log('Deliveries route loaded successfully');
  console.log('Type:', typeof deliveriesRoute);
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
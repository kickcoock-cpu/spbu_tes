// minimal-test.js
console.log('Testing deliveries route export...');

// Manually create what should be in the deliveries route file
const express = require('express');
const router = express.Router();

console.log('Router created:', typeof router);
console.log('Router use method:', typeof router.use);

// Try to mimic what deliveries.js does
const multer = require('multer');
const { protect, authorize } = require('./middleware/auth');

console.log('Middleware loaded');

// Test if we can use the router
try {
  router.get('/test', (req, res) => {
    res.json({ success: true });
  });
  console.log('Router test route added');
} catch (error) {
  console.error('Error adding test route:', error);
}

console.log('Router type:', typeof router);
console.log('Router constructor:', router.constructor.name);

module.exports = router;
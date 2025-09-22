// Test script to identify which route is causing the issue
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

// Get all route files
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

console.log('Testing route exports...');

routeFiles.forEach(file => {
  try {
    const routePath = path.join(routesDir, file);
    const route = require(routePath);
    
    // Check if it's a valid Express router
    if (route && typeof route === 'function' && route.name === 'router') {
      console.log(`${file}: ✓ Valid Express router`);
    } else if (route && typeof route === 'object' && route.constructor.name === 'Router') {
      console.log(`${file}: ✓ Valid Express router (object)`);
    } else {
      console.log(`${file}: ✗ Invalid export - not a router`);
      console.log(`  Type: ${typeof route}`);
      console.log(`  Constructor: ${route ? route.constructor.name : 'null'}`);
    }
  } catch (error) {
    console.log(`${file}: ✗ Error importing - ${error.message}`);
  }
});

console.log('Test complete.');
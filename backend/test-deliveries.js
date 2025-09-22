// Minimal test to check deliveries route import
console.log('Testing deliveries route import...');

try {
  const deliveriesRoute = require('./routes/deliveries');
  console.log('Deliveries route imported successfully');
  console.log('Type:', typeof deliveriesRoute);
  console.log('Constructor:', deliveriesRoute ? deliveriesRoute.constructor.name : 'null');
} catch (error) {
  console.log('Error importing deliveries route:', error.message);
  console.error(error.stack);
}

console.log('Test complete.');
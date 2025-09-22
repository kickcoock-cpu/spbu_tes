// test-deliveries-controller.js
console.log('Testing deliveries controller...');

try {
  console.log('Loading deliveries controller...');
  const deliveriesController = require('./controllers/deliveriesController');
  console.log('Deliveries controller loaded successfully');
  console.log('Controller type:', typeof deliveriesController);
  console.log('Controller keys:', Object.keys(deliveriesController));
} catch (error) {
  console.error('Error loading deliveries controller:', error.message);
  console.error('Stack trace:', error.stack);
}
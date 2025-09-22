// test-deliveries-controller-direct.js
console.log('Testing deliveries controller directly...');

try {
  console.log('Loading deliveries controller directly...');
  const deliveriesController = require('./controllers/deliveriesController');
  console.log('Deliveries controller loaded successfully');
  console.log('Controller type:', typeof deliveriesController);
  console.log('Controller keys:', Object.keys(deliveriesController));
  console.log('createDelivery function:', typeof deliveriesController.createDelivery);
} catch (error) {
  console.error('Error loading deliveries controller:');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
}
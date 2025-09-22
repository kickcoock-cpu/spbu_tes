// test-deliveries-route.js
try {
  const deliveriesRoute = require('./routes/deliveries');
  console.log('Deliveries route loaded successfully:', typeof deliveriesRoute);
  
  const salesRoute = require('./routes/sales');
  console.log('Sales route loaded successfully:', typeof salesRoute);
  
  console.log('Both routes loaded without errors');
} catch (error) {
  console.error('Error loading routes:', error.message);
}
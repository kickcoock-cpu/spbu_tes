// debug-deliveries-route.js
console.log('Debugging deliveries route...');

// Try to load the deliveries route and see what it exports
try {
  console.log('Loading deliveries route...');
  const deliveriesRoute = require('./routes/deliveries');
  console.log('Deliveries route loaded successfully');
  console.log('Type of export:', typeof deliveriesRoute);
  console.log('Constructor name:', deliveriesRoute.constructor.name);
  
  if (typeof deliveriesRoute === 'function') {
    console.log('Route is a function (likely Express router)');
  } else if (deliveriesRoute && typeof deliveriesRoute.use === 'function') {
    console.log('Route has use method (likely Express router object)');
  } else {
    console.log('Route is something else:', deliveriesRoute);
    console.log('Keys:', Object.keys(deliveriesRoute));
  }
} catch (error) {
  console.error('Error loading deliveries route:');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
}
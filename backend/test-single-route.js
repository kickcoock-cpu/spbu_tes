// test-single-route.js
try {
  console.log('Testing deliveries route...');
  const deliveriesRoute = require('./routes/deliveries');
  console.log('Deliveries route type:', typeof deliveriesRoute);
  console.log('Deliveries route constructor:', deliveriesRoute.constructor.name);
  
  if (typeof deliveriesRoute === 'function') {
    console.log('Deliveries route is a function');
  } else if (deliveriesRoute && typeof deliveriesRoute.use === 'function') {
    console.log('Deliveries route is a router object');
  } else {
    console.log('Deliveries route is something else:', deliveriesRoute);
  }
} catch (error) {
  console.error('Error loading deliveries route:', error.message);
  console.error('Stack trace:', error.stack);
}
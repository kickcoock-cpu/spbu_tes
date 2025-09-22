// Test script for real-time stockout predictions
const { calculateRealTimeStockoutPredictions } = require('./services/realtime-stockout-service');

async function testStockoutPredictions() {
  try {
    console.log('Testing real-time stockout predictions...');
    
    // Test calculation for all SPBUs
    console.log('\n1. Calculating predictions for all SPBUs:');
    const allPredictions = await calculateRealTimeStockoutPredictions();
    console.log(`Found ${allPredictions.length} predictions`);
    
    if (allPredictions.length > 0) {
      console.log('Sample prediction:');
      console.log(JSON.stringify(allPredictions[0], null, 2));
    }
    
    // Test calculation for a specific SPBU (if exists)
    console.log('\n2. Calculating predictions for SPBU ID 1:');
    const spbuPredictions = await calculateRealTimeStockoutPredictions({ spbuId: 1 });
    console.log(`Found ${spbuPredictions.length} predictions for SPBU ID 1`);
    
    if (spbuPredictions.length > 0) {
      console.log('Sample prediction for SPBU 1:');
      console.log(JSON.stringify(spbuPredictions[0], null, 2));
    }
    
    // Test calculation for a specific fuel type
    console.log('\n3. Calculating predictions for Pertamax:');
    const fuelTypePredictions = await calculateRealTimeStockoutPredictions({ fuelType: 'Pertamax' });
    console.log(`Found ${fuelTypePredictions.length} Pertamax predictions`);
    
    if (fuelTypePredictions.length > 0) {
      console.log('Sample Pertamax prediction:');
      console.log(JSON.stringify(fuelTypePredictions[0], null, 2));
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testStockoutPredictions();

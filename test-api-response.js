// Test script to check the actual API response for stockout predictions
const axios = require('axios');

async function testStockoutPrediction() {
  try {
    // Replace with your actual API endpoint
    const response = await axios.get('http://localhost:3000/api/prediction/stockout', {
      headers: {
        // Add any required authentication headers here
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('=== STOCKOUT PREDICTION API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Check if the data has the expected structure
    if (response.data && response.data.data && response.data.data.predictions) {
      console.log('=== PREDICTIONS DATA STRUCTURE ===');
      response.data.data.predictions.forEach((prediction, index) => {
        console.log(`Prediction ${index + 1}:`);
        console.log(`  fuelType: ${prediction.fuelType}`);
        console.log(`  currentStock: ${prediction.currentStock}`);
        console.log(`  avgDailyConsumption: ${prediction.avgDailyConsumption}`);
        console.log(`  daysUntilStockout: ${prediction.daysUntilStockout}`);
        console.log(`  predictedStockoutDate: ${prediction.predictedStockoutDate}`);
        console.log(`  recommendedOrderVolume: ${prediction.recommendedOrderVolume}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testStockoutPrediction();
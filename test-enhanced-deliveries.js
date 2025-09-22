// Test script for enhanced deliveries predictions
const { enhancedDeliveryPrediction, calculateDeliveryConfidence, calculateDeliveryTiming, 
        getUrgencyLevel, calculateSafetyStock, analyzeDeliveryHistory } = require('./backend/utils/delivery-prediction');

console.log('=== ENHANCED DELIVERIES PREDICTIONS TEST ===\n');

// Test 1: Basic delivery prediction
console.log('Test 1: Basic delivery prediction');
const basicPrediction = enhancedDeliveryPrediction({
  fuelType: 'Pertamax',
  currentStock: 5000,
  tankCapacity: 10000,
  avgDailyConsumption: 500,
  stdDevConsumption: 100,
  deliveryHistory: [
    { id: 1, liters: 8000, actual_liters: 7900, created_at: '2023-05-01' },
    { id: 2, liters: 8500, actual_liters: 8400, created_at: '2023-05-15' },
    { id: 3, liters: 7500, actual_liters: 7600, created_at: '2023-05-30' }
  ]
});

console.log('Basic Prediction:', JSON.stringify(basicPrediction, null, 2));
console.log('\n---\n');

// Test 2: High urgency delivery prediction
console.log('Test 2: High urgency delivery prediction');
const urgentPrediction = enhancedDeliveryPrediction({
  fuelType: 'Pertalite',
  currentStock: 1000,
  tankCapacity: 5000,
  avgDailyConsumption: 300,
  stdDevConsumption: 50,
  deliveryHistory: [
    { id: 1, liters: 4000, actual_liters: 3900, created_at: '2023-05-01' },
    { id: 2, liters: 4200, actual_liters: 4100, created_at: '2023-05-15' }
  ]
});

console.log('Urgent Prediction:', JSON.stringify(urgentPrediction, null, 2));
console.log('\n---\n');

// Test 3: Low consumption prediction
console.log('Test 3: Low consumption prediction');
const lowConsumptionPrediction = enhancedDeliveryPrediction({
  fuelType: 'Solar',
  currentStock: 8000,
  tankCapacity: 10000,
  avgDailyConsumption: 50,
  stdDevConsumption: 10,
  deliveryHistory: [
    { id: 1, liters: 2000, actual_liters: 1950, created_at: '2023-05-01' }
  ]
});

console.log('Low Consumption Prediction:', JSON.stringify(lowConsumptionPrediction, null, 2));
console.log('\n---\n');

// Test 4: Utility functions
console.log('Test 4: Utility functions');

// Test confidence calculation
const confidence = calculateDeliveryConfidence({
  historicalAccuracy: 85,
  volumeConsistency: 90,
  seasonalStability: 75,
  supplierReliability: 95
});
console.log('Calculated Confidence:', confidence);

// Test urgency level
const urgency = getUrgencyLevel(3);
console.log('Urgency Level (3 days):', urgency);

// Test safety stock calculation
const safetyStock = calculateSafetyStock(500, 100);
console.log('Safety Stock (500 avg, 100 std dev):', safetyStock);

// Test delivery timing
const timing = calculateDeliveryTiming({
  currentStock: 2000,
  avgDailyConsumption: 200,
  safetyStock: 500,
  supplierLeadTime: 2,
  tankCapacity: 5000
});
console.log('Delivery Timing:', JSON.stringify(timing, null, 2));

// Test delivery history analysis
const historyAnalysis = analyzeDeliveryHistory([
  { id: 1, liters: 4000, planned_liters: 4000, actual_liters: 3900, created_at: '2023-05-01' },
  { id: 2, liters: 4200, planned_liters: 4200, actual_liters: 4100, created_at: '2023-05-15' },
  { id: 3, liters: 3800, planned_liters: 3800, actual_liters: 3850, created_at: '2023-05-30' }
]);
console.log('History Analysis:', JSON.stringify(historyAnalysis, null, 2));

console.log('\n=== END TEST ===');
// Test script for enhanced demand predictions
const { enhancedDemandPrediction, enhancedFuelDemandPrediction, calculateMovingAverage, 
        calculateEMA, detectSeasonality, linearRegression, calculateConfidenceInterval, 
        calculateSeasonalFactors } = require('./backend/utils/demand-prediction');

console.log('=== ENHANCED DEMAND PREDICTIONS TEST ===\n');

// Test 1: Basic fuel demand prediction
console.log('Test 1: Basic fuel demand prediction');
const sampleHistoricalData = [
  { date: '2023-05-01', fuelTypes: [{ fuelType: 'Pertamax', liters: 1000, transactions: 50 }] },
  { date: '2023-05-02', fuelTypes: [{ fuelType: 'Pertamax', liters: 1200, transactions: 60 }] },
  { date: '2023-05-03', fuelTypes: [{ fuelType: 'Pertamax', liters: 900, transactions: 45 }] },
  { date: '2023-05-04', fuelTypes: [{ fuelType: 'Pertamax', liters: 1100, transactions: 55 }] },
  { date: '2023-05-05', fuelTypes: [{ fuelType: 'Pertamax', liters: 1300, transactions: 65 }] },
  { date: '2023-05-06', fuelTypes: [{ fuelType: 'Pertamax', liters: 1500, transactions: 75 }] },
  { date: '2023-05-07', fuelTypes: [{ fuelType: 'Pertamax', liters: 800, transactions: 40 }] }
];

const basicFuelPrediction = enhancedFuelDemandPrediction(sampleHistoricalData, 'Pertamax');
console.log('Basic Fuel Prediction:', JSON.stringify(basicFuelPrediction, null, 2));
console.log('\n---\n');

// Test 2: Enhanced demand prediction for multiple fuel types
console.log('Test 2: Enhanced demand prediction for multiple fuel types');
const multiFuelHistoricalData = [
  { 
    date: '2023-05-01', 
    fuelTypes: [
      { fuelType: 'Pertamax', liters: 1000, transactions: 50 },
      { fuelType: 'Pertalite', liters: 800, transactions: 40 },
      { fuelType: 'Solar', liters: 500, transactions: 25 }
    ] 
  },
  { 
    date: '2023-05-02', 
    fuelTypes: [
      { fuelType: 'Pertamax', liters: 1200, transactions: 60 },
      { fuelType: 'Pertalite', liters: 900, transactions: 45 },
      { fuelType: 'Solar', liters: 600, transactions: 30 }
    ] 
  },
  { 
    date: '2023-05-03', 
    fuelTypes: [
      { fuelType: 'Pertamax', liters: 900, transactions: 45 },
      { fuelType: 'Pertalite', liters: 700, transactions: 35 },
      { fuelType: 'Solar', liters: 400, transactions: 20 }
    ] 
  }
];

const multiFuelPrediction = enhancedDemandPrediction(multiFuelHistoricalData, ['Pertamax', 'Pertalite', 'Solar']);
console.log('Multi-Fuel Prediction:', JSON.stringify(multiFuelPrediction, null, 2));
console.log('\n---\n');

// Test 3: Utility functions
console.log('Test 3: Utility functions');

// Test moving average calculation
const movingAvg = calculateMovingAverage([1, 2, 3, 4, 5, 6, 7], 3);
console.log('Moving Average (window=3):', movingAvg);

// Test exponential moving average
const ema = calculateEMA([1, 2, 3, 4, 5, 6, 7], 0.3);
console.log('Exponential Moving Average (alpha=0.3):', ema);

// Test linear regression
const dataPoints = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 3 },
  { x: 3, y: 4 },
  { x: 4, y: 5 }
];
const regression = linearRegression(dataPoints);
console.log('Linear Regression:', regression);

// Test seasonal factors calculation
const seasonalData = [
  { date: '2023-05-01', fuelTypes: [{ fuelType: 'Pertamax', liters: 1000 }] }, // Monday
  { date: '2023-05-02', fuelTypes: [{ fuelType: 'Pertamax', liters: 1200 }] }, // Tuesday
  { date: '2023-05-03', fuelTypes: [{ fuelType: 'Pertamax', liters: 900 }] },  // Wednesday
  { date: '2023-05-04', fuelTypes: [{ fuelType: 'Pertamax', liters: 1100 }] }, // Thursday
  { date: '2023-05-05', fuelTypes: [{ fuelType: 'Pertamax', liters: 1300 }] }, // Friday
  { date: '2023-05-06', fuelTypes: [{ fuelType: 'Pertamax', liters: 1500 }] }, // Saturday
  { date: '2023-05-07', fuelTypes: [{ fuelType: 'Pertamax', liters: 800 }] }   // Sunday
];
const seasonalFactors = calculateSeasonalFactors(seasonalData, 'Pertamax');
console.log('Seasonal Factors:', seasonalFactors);

console.log('\n=== END TEST ===');
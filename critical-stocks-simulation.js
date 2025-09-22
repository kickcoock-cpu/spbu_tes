// Simulating the actual issue with Critical Stocks
// This test will help us understand what's happening with the data

// Sample data structure that might be coming from the API
const sampleStockPredictions = [
  {
    fuelType: "Premium",
    currentStock: 800,
    tankCapacity: 1000,
    avgDailyConsumption: 50,
    avgTransactionsPerDay: 10,
    consumptionTrend: "stable",
    confidenceLevel: "high",
    predictedStockoutDate: "2023-06-15T10:00:00.000Z",
    daysUntilStockout: 3 // This should be critical
  },
  {
    fuelType: "Solar",
    currentStock: 1200,
    tankCapacity: 2000,
    avgDailyConsumption: 30,
    avgTransactionsPerDay: 8,
    consumptionTrend: "stable",
    confidenceLevel: "high",
    predictedStockoutDate: "2023-06-20T10:00:00.000Z",
    daysUntilStockout: 7 // This should NOT be critical
  },
  {
    fuelType: "Pertamax",
    currentStock: 200,
    tankCapacity: 1000,
    avgDailyConsumption: 0,
    avgTransactionsPerDay: 0,
    consumptionTrend: "stable",
    confidenceLevel: "low",
    predictedStockoutDate: "2023-06-12T10:00:00.000Z",
    daysUntilStockout: 5 // This should be critical (edge case)
  }
];

console.log("Sample stock predictions:", sampleStockPredictions);

// Apply the filtering logic
const criticalStocks = sampleStockPredictions.filter(stock => {
  console.log(`--- Checking stock: ${stock.fuelType} ---`);
  console.log(`  daysUntilStockout: ${stock.daysUntilStockout}`);
  console.log(`  Type: ${typeof stock.daysUntilStockout}`);
  
  // Our filtering logic
  const days = Number(stock.daysUntilStockout);
  console.log(`  Converted days: ${days}`);
  console.log(`  Is NaN: ${isNaN(days)}`);
  console.log(`  Is Finite: ${isFinite(days)}`);
  
  const isCritical = !isNaN(days) && isFinite(days) && days <= 5;
  console.log(`  Is Critical: ${isCritical}`);
  
  return isCritical;
});

console.log("Critical stocks found:", criticalStocks);
console.log("Critical stocks count:", criticalStocks.length);
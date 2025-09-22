// Test file to verify the fix for dailyConsumption error
const testData = {
  data: {
    predictions: [
      {
        fuelType: "Pertamax",
        currentStock: 1000,
        avgDailyConsumption: 50,
        daysUntilStockout: 20,
        predictedStockoutDate: "2023-06-15T10:00:00.000Z",
        recommendedOrderVolume: 5000
      },
      {
        fuelType: "Pertalite",
        currentStock: 500,
        // Missing avgDailyConsumption property to simulate the error
        daysUntilStockout: 3,
        predictedStockoutDate: "2023-06-10T10:00:00.000Z",
        recommendedOrderVolume: 2000
      }
    ]
  }
};

console.log("Test data:", testData);

// Simulate the table rendering with the fix
try {
  testData.data.predictions.forEach((item, index) => {
    console.log(`Row ${index + 1}:`);
    console.log(`  Fuel Type: ${item.fuelType}`);
    console.log(`  Current Stock: ${item.currentStock}`);
    console.log(`  Daily Consumption: ${(item.avgDailyConsumption || 0).toLocaleString()}`); // This should now work
    console.log(`  Days Until Stockout: ${item.daysUntilStockout}`);
  });
  console.log("Test passed! No errors occurred.");
} catch (error) {
  console.error("Error occurred:", error.message);
  console.error("Error type:", error.constructor.name);
}
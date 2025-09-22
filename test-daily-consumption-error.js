// Test file to reproduce the dailyConsumption error more accurately
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

// Simulate the table rendering with toLocaleString() which would cause the error
try {
  testData.data.predictions.forEach((item, index) => {
    console.log(`Row ${index + 1}:`);
    console.log(`  Fuel Type: ${item.fuelType}`);
    console.log(`  Current Stock: ${item.currentStock}`);
    console.log(`  Daily Consumption: ${item.avgDailyConsumption.toLocaleString()}`); // This should cause an error for the second item
    console.log(`  Days Until Stockout: ${item.daysUntilStockout}`);
  });
} catch (error) {
  console.error("Error occurred:", error.message);
  console.error("Error type:", error.constructor.name);
}
// Test data to verify critical stocks filtering logic
const testData = [
  { fuelType: "Premium", daysUntilStockout: "3" }, // String number
  { fuelType: "Solar", daysUntilStockout: 2 }, // Actual number
  { fuelType: "Pertamax", daysUntilStockout: "7" }, // String number > 5
  { fuelType: "Pertalite", daysUntilStockout: 1 }, // Actual number
  { fuelType: "Dex", daysUntilStockout: "4.5" }, // String float
  { fuelType: "Bio Solar", daysUntilStockout: null }, // Null value
  { fuelType: "Non-Available", daysUntilStockout: undefined }, // Undefined value
];

console.log("Test Data:", testData);

const filtered = testData.filter(stock => {
  console.log(`--- Checking stock: ${stock.fuelType} ---`);
  console.log(`  Raw daysUntilStockout: ${stock.daysUntilStockout}`);
  console.log(`  Type of daysUntilStockout: ${typeof stock.daysUntilStockout}`);
  
  // Handle different data types that might come from the API
  let days;
  if (typeof stock.daysUntilStockout === 'string') {
    // Try to parse string to number
    days = parseFloat(stock.daysUntilStockout);
  } else if (typeof stock.daysUntilStockout === 'number') {
    // Already a number
    days = stock.daysUntilStockout;
  } else {
    // Convert to number (handles null, undefined, etc.)
    days = Number(stock.daysUntilStockout);
  }
  
  console.log(`  Converted days: ${days}`);
  console.log(`  Is NaN: ${isNaN(days)}`);
  console.log(`  Is Finite: ${isFinite(days)}`);
  
  // Additional check for edge cases
  if (isNaN(days) || !isFinite(days)) {
    console.log('  Skipping due to invalid number');
    return false;
  }
  
  // Check if it's a valid number and less than or equal to 5
  const isCritical = days <= 5;
  console.log(`  Is Critical: ${isCritical}`);
  
  return isCritical;
});

console.log("Filtered critical stocks:", filtered);
console.log("Count:", filtered.length);
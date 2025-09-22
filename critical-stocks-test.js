// Critical Stocks Filtering Test
// This file can be used to test the filtering logic with actual data

function testCriticalStocksFiltering(stockPredictions) {
  console.log('=== CRITICAL STOCKS FILTERING TEST ===');
  console.log('Input data:', stockPredictions);
  
  if (!stockPredictions || !Array.isArray(stockPredictions)) {
    console.log('Invalid input: not an array');
    return [];
  }
  
  console.log(`Processing ${stockPredictions.length} stock predictions`);
  
  const filtered = stockPredictions.filter(stock => {
    // Skip if stock data is invalid
    if (!stock || typeof stock !== 'object') {
      console.log('Invalid stock data:', stock);
      return false;
    }
    
    console.log(`--- Checking stock: ${stock.fuelType || 'Unknown'} ---`);
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
    console.log(`  Is Critical: ${isCritical} (days: ${days})`);
    
    return isCritical;
  }) || [];
  
  console.log(`Filtered critical stocks count: ${filtered.length}`);
  console.log('Filtered critical stocks:', filtered);
  console.log('=== END CRITICAL STOCKS FILTERING TEST ===');
  
  return filtered;
}

// Example usage:
// testCriticalStocksFiltering(yourStockPredictionsArray);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCriticalStocksFiltering };
}
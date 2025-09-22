// Test the formatNumber function to ensure it doesn't produce leading zeros

// Test cases
const testCases = [
  0,
  1,
  10,
  100,
  1000,
  10000,
  0.5,
  1.5,
  10.25,
  100.75,
  1000.123,
  0.0,
  0.00,
  1000000
];

console.log("Testing formatNumber function:");

testCases.forEach(testCase => {
  // Simulate the formatNumber function
  const formatNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) {
      return '0';
    }
    
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  };
  
  const result = formatNumber(testCase);
  console.log(`${testCase} -> "${result}"`);
  
  // Check for leading zeros
  if (result.startsWith('0') && result.length > 1 && result[1] !== ',' && result[1] !== '.') {
    console.log(`  ⚠️  WARNING: Leading zero detected!`);
  }
});
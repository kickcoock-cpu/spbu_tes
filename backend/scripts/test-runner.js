/**
 * Test Runner for Sale Scripts
 * 
 * This script verifies that the sale test scripts can be imported and executed correctly.
 */

console.log('🧪 Testing Sale Scripts');

// Test that we can import the scripts without errors
try {
  const liveSaleTest = require('./live-sale-test');
  console.log('✅ Live sale test script imported successfully');
  
  const saleTest = require('./sale-test');
  console.log('✅ Sale test script imported successfully');
  
  console.log('\n🚀 Scripts are ready for testing!');
  console.log('\nTo run the tests:');
  console.log('  node sale-test.js                    # Run basic sale tests');
  console.log('  node sale-test.js --insufficient-stock # Test insufficient stock handling');
  console.log('  node live-sale-test.js               # Run comprehensive live tests');
  
} catch (error) {
  console.error('❌ Error importing scripts:', error.message);
  process.exit(1);
}
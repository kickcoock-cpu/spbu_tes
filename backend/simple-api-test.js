// Simple API test script for SIMONTOK
// This script demonstrates how to test the API with proper error handling

const https = require('https');

console.log('🚀 SIMONTOK API Test Script');
console.log('==========================');
console.log('Note: This script may encounter Vercel authentication protection.');
console.log('For best results, use the HTML tester or a REST client.\n');

// Simple function to test if we can reach the API at all
function testApiConnectivity() {
  console.log('📡 Testing API connectivity...');
  
  const options = {
    hostname: 'simontok-api.vercel.app',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'SIMONTOK-Test-Script/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Server responded with status code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ API is accessible');
    } else if (res.statusCode === 401) {
      console.log('⚠️  API is protected by Vercel authentication (expected for security)');
      console.log('💡 Solution: Use the HTML tester (api-tester.html) or a browser-based REST client');
    } else {
      console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
    }
    
    // Show next steps
    showNextSteps();
  });

  req.on('error', (error) => {
    console.log('❌ Connection error:', error.message);
    showNextSteps();
  });

  req.end();
}

function showNextSteps() {
  console.log('\n📋 Next Steps:');
  console.log('1. Open "api-tester.html" in your browser to test the API with a GUI');
  console.log('2. Use a REST client like Postman or Insomnia with these credentials:');
  console.log('   - Username: superadmin');
  console.log('   - Password: Pertamina1*');
  console.log('3. For programmatic access, use a browser-based approach or frontend application');
  console.log('\n🔐 API Endpoint: https://simontok-api.vercel.app');
  console.log('📘 Documentation: See API-TESTING-GUIDE.md for detailed instructions');
}

// Run the test
testApiConnectivity();
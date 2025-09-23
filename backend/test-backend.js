// Auto Testing untuk Backend API
import https from 'https';

// Konfigurasi
const BACKEND_URL = 'https://simontok-api.vercel.app';
const TIMEOUT = 10000; // 10 detik

// Test cases untuk backend API
const backendTests = [
  {
    name: 'Health Check Endpoint',
    path: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Root Endpoint',
    path: '/',
    method: 'GET',
    expectedStatus: 200
  }
];

// Fungsi untuk membuat HTTP request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.setTimeout(TIMEOUT);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Fungsi untuk menjalankan satu test
async function runTest(testCase) {
  console.log(`

🧪 Menjalankan test: ${testCase.name}`);
  
  const options = {
    hostname: new URL(BACKEND_URL).hostname,
    port: 443,
    path: testCase.path,
    method: testCase.method,
    headers: {
      'User-Agent': 'Vercel-Backend-Test/1.0',
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`  Status: ${response.statusCode}`);
    
    // Parse JSON response jika memungkinkan
    try {
      const jsonData = JSON.parse(response.data);
      console.log(`  Response: ${JSON.stringify(jsonData, null, 2)}`);
    } catch (e) {
      console.log(`  Response: ${response.data.substring(0, 200)}...`);
    }
    
    if (response.statusCode === testCase.expectedStatus) {
      console.log(`  ✅ PASSED`);
      return true;
    } else {
      console.log(`  ❌ FAILED - Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return false;
  }
}

// Fungsi utama untuk menjalankan semua test backend
async function runBackendTests() {
  console.log(`🚀 Memulai testing backend API di ${BACKEND_URL}`);
  
  let passedTests = 0;
  let totalTests = backendTests.length;
  
  for (const testCase of backendTests) {
    const passed = await runTest(testCase);
    if (passed) passedTests++;
  }
  
  console.log(`

📊 Hasil Testing Backend:`);
  console.log(`   ${passedTests}/${totalTests} test berhasil`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Semua test backend berhasil!');
    return true;
  } else {
    console.log('❌ Beberapa test backend gagal!');
    return false;
  }
}

// Export fungsi
export {
  runBackendTests
};

// Jalankan test jika file dijalankan langsung
if (import.meta.url === `file://${process.argv[1]}`) {
  runBackendTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
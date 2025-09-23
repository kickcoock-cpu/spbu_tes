// Test script for SIMONTOK API with superadmin credentials
const https = require('https');

// Configuration
const API_BASE_URL = 'simontok-api.vercel.app';
const SUPERADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'Pertamina1*'
};

let authToken = null;

// Utility function to make HTTP requests
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            raw: true
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
};

// Test 1: Health Check Endpoint
const testHealthEndpoint = async () => {
  console.log('\n=== Testing Health Endpoint ===');
  
  const options = {
    hostname: API_BASE_URL,
    port: 443,
    path: '/health',
    method: 'GET',
    headers: {
      'User-Agent': 'SIMONTOK-API-Test/1.0'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.statusCode === 200;
  } catch (error) {
    console.error('Error testing health endpoint:', error.message);
    return false;
  }
};

// Test 2: Login Endpoint
const testLogin = async () => {
  console.log('\n=== Testing Login Endpoint ===');
  
  const postData = JSON.stringify(SUPERADMIN_CREDENTIALS);
  
  const options = {
    hostname: API_BASE_URL,
    port: 443,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'SIMONTOK-API-Test/1.0'
    }
  };

  try {
    const response = await makeRequest(options, postData);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful! Token acquired.');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing login endpoint:', error.message);
    return false;
  }
};

// Test 3: Protected Endpoint - Get Current User
const testGetCurrentUser = async () => {
  if (!authToken) {
    console.log('\n=== Skipping Get Current User (No Auth Token) ===');
    return false;
  }
  
  console.log('\n=== Testing Get Current User Endpoint ===');
  
  const options = {
    hostname: API_BASE_URL,
    port: 443,
    path: '/api/users/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'User-Agent': 'SIMONTOK-API-Test/1.0'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Get current user successful!');
      return true;
    } else {
      console.log('❌ Get current user failed:', response.data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing get current user endpoint:', error.message);
    return false;
  }
};

// Test 4: Protected Endpoint - Get All Users (Super Admin)
const testGetAllUsers = async () => {
  if (!authToken) {
    console.log('\n=== Skipping Get All Users (No Auth Token) ===');
    return false;
  }
  
  console.log('\n=== Testing Get All Users Endpoint ===');
  
  const options = {
    hostname: API_BASE_URL,
    port: 443,
    path: '/api/users',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'User-Agent': 'SIMONTOK-API-Test/1.0'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Get all users successful!');
      return true;
    } else {
      console.log('❌ Get all users failed:', response.data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing get all users endpoint:', error.message);
    return false;
  }
};

// Test 5: Dashboard Endpoint
const testDashboard = async () => {
  if (!authToken) {
    console.log('\n=== Skipping Dashboard (No Auth Token) ===');
    return false;
  }
  
  console.log('\n=== Testing Dashboard Endpoint ===');
  
  const options = {
    hostname: API_BASE_URL,
    port: 443,
    path: '/api/dashboard',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'User-Agent': 'SIMONTOK-API-Test/1.0'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Dashboard access successful!');
      return true;
    } else {
      console.log('❌ Dashboard access failed:', response.data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing dashboard endpoint:', error.message);
    return false;
  }
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting SIMONTOK API Tests with Super Admin Credentials');
  console.log('=========================================================');
  
  const results = {
    health: false,
    login: false,
    currentUser: false,
    allUsers: false,
    dashboard: false
  };
  
  // Test health endpoint
  results.health = await testHealthEndpoint();
  
  // Test login
  results.login = await testLogin();
  
  // Test protected endpoints only if login was successful
  if (results.login) {
    results.currentUser = await testGetCurrentUser();
    results.allUsers = await testGetAllUsers();
    results.dashboard = await testDashboard();
  }
  
  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('===============');
  console.log('Health Endpoint:     ', results.health ? '✅ PASS' : '❌ FAIL');
  console.log('Login:               ', results.login ? '✅ PASS' : '❌ FAIL');
  console.log('Get Current User:    ', results.currentUser ? '✅ PASS' : '❌ FAIL');
  console.log('Get All Users:       ', results.allUsers ? '✅ PASS' : '❌ FAIL');
  console.log('Dashboard Access:    ', results.dashboard ? '✅ PASS' : '❌ FAIL');
  
  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.values(results).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (authToken) {
    console.log(`\n🔐 Auth Token: ${authToken.substring(0, 20)}...${authToken.substring(authToken.length - 20)}`);
  }
  
  return results;
};

// Run the tests
runAllTests().catch(error => {
  console.error('Unexpected error during testing:', error);
});
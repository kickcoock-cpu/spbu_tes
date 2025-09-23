// Test script to verify API endpoints
const https = require('https');

// Test the login endpoint
const testLogin = () => {
  const postData = JSON.stringify({
    username: 'superadmin',
    password: 'Pertamina1*'
  });

  const options = {
    hostname: 'simontok-api.vercel.app',
    port: 443,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('Response Body:', data);
      
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.token) {
          console.log('✅ Login successful!');
          console.log('Token:', jsonData.token);
          // Test a protected endpoint with the token
          testProtectedEndpoint(jsonData.token);
        } else {
          console.log('❌ Login failed:', jsonData.message);
        }
      } catch (error) {
        console.log('Response is not JSON:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(postData);
  req.end();
};

// Test a protected endpoint
const testProtectedEndpoint = (token) => {
  const options = {
    hostname: 'simontok-api.vercel.app',
    port: 443,
    path: '/api/users/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== Protected Endpoint Test ===');
      console.log('Status Code:', res.statusCode);
      console.log('Response Body:', data);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
};

// Test the health endpoint
const testHealth = () => {
  const options = {
    hostname: 'simontok-api.vercel.app',
    port: 443,
    path: '/health',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('=== Health Endpoint Test ===');
      console.log('Status Code:', res.statusCode);
      console.log('Response Body:', data);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
};

// Run tests
console.log('Testing API endpoints...\n');
testHealth();
setTimeout(testLogin, 1000);
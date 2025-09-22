const fs = require('fs');
const path = require('path');
const { getLocalIP } = require('../utils/network');

// Get the local IP address
const localIP = getLocalIP();

if (!localIP) {
  console.error('Could not determine local IP address');
  process.exit(1);
}

console.log(`Local IP address: ${localIP}`);

// Read the .env file
const envPath = path.join(__dirname, '..', '..', 'frontend', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Update the VITE_API_URL with the local IP
const newEnvContent = envContent.replace(
  /VITE_API_URL=.*/,
  `VITE_API_URL=http://${localIP}:3000`
);

// Write the updated content back to the file
fs.writeFileSync(envPath, newEnvContent);

console.log(`Updated VITE_API_URL to http://${localIP}:3000 in frontend/.env`);
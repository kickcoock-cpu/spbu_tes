// Test file untuk memverifikasi syntax userController
console.log('Testing userController syntax...');

try {
  const fs = require('fs');
  const path = require('path');
  
  // Baca file userController
  const controllerPath = path.join(__dirname, 'userController.js');
  const content = fs.readFileSync(controllerPath, 'utf8');
  
  // Coba parse sebagai JavaScript
  new Function(content);
  
  console.log('✅ Syntax check passed');
} catch (error) {
  console.log('❌ Syntax check failed:', error.message);
  console.log('Line:', error.lineNumber);
}
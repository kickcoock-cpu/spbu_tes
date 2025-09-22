const fs = require('fs');
const path = require('path');

describe('Project Structure', () => {
  test('should have required directories', () => {
    expect(fs.existsSync(path.join(__dirname, '..', 'controllers'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', 'routes'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', 'models'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', 'middleware'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', 'config'))).toBe(true);
  });

  test('should have required files', () => {
    // Config files
    expect(fs.existsSync(path.join(__dirname, '..', 'config', 'db.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', 'config', 'roles.js'))).toBe(true);
    
    // Middleware files
    expect(fs.existsSync(path.join(__dirname, '..', 'middleware', 'auth.js'))).toBe(true);
    
    // Main files
    expect(fs.existsSync(path.join(__dirname, '..', 'index.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '.env'))).toBe(true);
  });
});
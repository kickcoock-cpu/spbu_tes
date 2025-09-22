// test-routes.js
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

// Check all route files
fs.readdir(routesDir, (err, files) => {
  if (err) {
    console.error('Error reading routes directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.js')) {
      try {
        const routeModule = require(path.join(routesDir, file));
        console.log(`${file}:`, typeof routeModule, routeModule.constructor.name);
        
        // Check if it's a function or router
        if (typeof routeModule !== 'function' && !routeModule.use) {
          console.log(`  WARNING: ${file} may not export a proper router`);
        }
      } catch (err) {
        console.error(`Error loading ${file}:`, err.message);
      }
    }
  });
});
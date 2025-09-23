// Test script to check if routes can be imported properly
import('./routes/users.js').then(module => {
  console.log('✅ users.js imported successfully');
  console.log('Module has default export:', !!module.default);
  console.log('Module type:', typeof module.default);
}).catch(error => {
  console.error('❌ Error importing users.js:', error);
});

import('./routes/dashboard.js').then(module => {
  console.log('✅ dashboard.js imported successfully');
  console.log('Module has default export:', !!module.default);
}).catch(error => {
  console.error('❌ Error importing dashboard.js:', error);
});
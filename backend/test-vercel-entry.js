// Test file to verify vercel-entry.js works correctly
(async () => {
  try {
    const module = await import('./vercel-entry.js');
    console.log('✅ vercel-entry.js loaded successfully');
    console.log('Module has default export:', !!module.default);
  } catch (error) {
    console.error('❌ Error loading vercel-entry.js:', error);
  }
})();
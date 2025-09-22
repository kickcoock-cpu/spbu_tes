module.exports = {
  hooks: {
    readPackage(pkg) {
      // Approve build scripts for these packages
      if (pkg.name === '@clerk/shared' || 
          pkg.name === '@swc/core' || 
          pkg.name === '@tailwindcss/oxide' || 
          pkg.name === 'esbuild') {
        pkg.build = true;
      }
      return pkg;
    }
  }
};
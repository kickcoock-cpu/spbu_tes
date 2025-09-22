const { networkInterfaces } = require('os');

console.log('=== Network Access Information ===');
console.log('Backend server will be accessible at the following addresses:');

const nets = networkInterfaces();
for (const [name, interfaces] of Object.entries(nets)) {
  for (const iface of interfaces) {
    // Skip internal (loopback) and IPv6 addresses
    if (!iface.internal && iface.family === 'IPv4') {
      console.log(`  ${name}: http://${iface.address}:3000`);
    }
  }
}

console.log('\nTo access from other devices on the same network:');
console.log('  1. Make sure your firewall allows connections on port 3000');
console.log('  2. Use one of the IP addresses listed above');
console.log('  3. Example: http://192.168.1.100:3000');
const os = require('os');

/**
 * Get the local IP address of the machine
 * @returns {string|null} The local IP address or null if not found
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and IPv6 addresses
      if (iface.internal || iface.family !== 'IPv4') {
        continue;
      }
      
      // Return the first non-internal IPv4 address
      // Prefer addresses in the 192.168.x.x range
      if (iface.address.startsWith('192.168.')) {
        return iface.address;
      }
    }
  }
  
  // If no 192.168.x.x address found, try other private IP ranges
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.internal || iface.family !== 'IPv4') {
        continue;
      }
      
      // Check for other private IP ranges
      if (iface.address.startsWith('10.') || 
          (iface.address.startsWith('172.') && 
           parseInt(iface.address.split('.')[1]) >= 16 && 
           parseInt(iface.address.split('.')[1]) <= 31)) {
        return iface.address;
      }
    }
  }
  
  return null;
}

/**
 * Get all local IP addresses of the machine
 * @returns {string[]} Array of local IP addresses
 */
function getAllLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and IPv6 addresses
      if (iface.internal || iface.family !== 'IPv4') {
        continue;
      }
      
      ips.push(iface.address);
    }
  }
  
  return ips;
}

module.exports = {
  getLocalIP,
  getAllLocalIPs
};
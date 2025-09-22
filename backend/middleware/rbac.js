const roles = require('../config/roles');

const authorize = (...permittedRoles) => {
  return (req, res, next) => {
    // If user role is not in permitted roles, deny access
    if (!permittedRoles.includes(req.user.Role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    // Check specific permission for the resource
    const urlParts = req.originalUrl.split('/').filter(part => part);
    const resource = urlParts[1]; // Extract resource from URL (e.g., 'api/users' -> 'users')
    
    // Map URL segments to permission keys
    const resourceMap = {
      'dashboard': 'dashboard',
      'users': 'users',
      'roles': 'users', // Roles are part of user management
      'spbu': 'spbu',
      'sales': 'sales',
      'deliveries': 'deliveries',
      'deposits': 'deposits',
      'prices': 'prices',
      'reports': 'reports',
      'attendance': 'attendance',
      'adjustments': 'adjustments',
      'audit': 'audit',
      'prediction': 'prediction',
      'tanks': 'tanks'
    };
    
    const permissionKey = resourceMap[resource];
    
    if (!permissionKey) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Resource not recognized.'
      });
    }
    
    const userRole = req.user.Role.name;
    const userPermission = roles[userRole][permissionKey];
    
    // Define what each permission level allows
    const permissionLevels = {
      'full': ['create', 'read', 'read-one', 'update', 'delete', 'approve', 'confirm', 'reject'],
      'read-only': ['read'],
      'limited': ['create', 'confirm', 'check-in', 'check-out', 'read-one'],
      'none': []
    };
    
    // Determine the action being performed
    let action = 'read'; // Default action for list
    if (req.method === 'POST') action = 'create';
    if (req.method === 'PUT' || req.method === 'PATCH') action = 'update';
    if (req.method === 'DELETE') action = 'delete';
    
    // Special cases for specific endpoints
    if (req.originalUrl.includes('approve')) action = 'approve';
    if (req.originalUrl.includes('confirm')) action = 'confirm';
    if (req.originalUrl.includes('reject')) action = 'reject';
    if (req.originalUrl.includes('check-in')) action = 'check-in';
    if (req.originalUrl.includes('check-out')) action = 'check-out';
    
    // Distinguish between read all and read one
    if (action === 'read' && req.params.id) {
      action = 'read-one';
    }
    
    // Check permissions
    const allowedActions = permissionLevels[userPermission] || [];
    
    if (action === 'read') {
      // For GET requests to list all items
      if (!allowedActions.includes('read')) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${userRole} role does not have ${action} permission for ${resource}.`
        });
      }
    } else if (action === 'read-one') {
      // For GET requests to view a single item
      if (!allowedActions.includes('read') && !allowedActions.includes('read-one')) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${userRole} role does not have ${action} permission for ${resource}.`
        });
      }
    } else {
      // For other actions
      if (userPermission !== 'full' && !allowedActions.includes(action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${userRole} role does not have ${action} permission for ${resource}.`
        });
      }
    }
    
    next();
  };
};

module.exports = { authorize };
// RBAC utility functions based on MENU_RBAC.md

// Define the permission levels
export type PermissionLevel = 'full' | 'read-only' | 'limited' | 'none';

// Define the available permissions
export type PermissionKey = 
  | 'dashboard'
  | 'users'
  | 'spbu'
  | 'sales'
  | 'deliveries'
  | 'deposits'
  | 'prices'
  | 'reports'
  | 'attendance'
  | 'adjustments'
  | 'audit'
  | 'prediction'
  | 'notifications';
  

// Define the roles and their permissions
const rolesPermissions: Record<string, Record<PermissionKey, PermissionLevel>> = {
  'Super Admin': {
    dashboard: 'full',
    users: 'full',
    spbu: 'full',
    sales: 'read-only',
    deliveries: 'full',
    deposits: 'full',
    prices: 'full',
    reports: 'full',
    attendance: 'read-only',
    adjustments: 'full',
    audit: 'full',
    prediction: 'full',
    notifications: 'full'
  },
  'Admin': {
    dashboard: 'full',
    users: 'read-only',
    spbu: 'read-only',
    sales: 'read-only',
    deliveries: 'full',
    deposits: 'full',
    prices: 'full',
    reports: 'full',
    attendance: 'read-only',
    adjustments: 'full',
    audit: 'read-only',
    prediction: 'read-only',
    notifications: 'full'
  },
  'Operator': {
    dashboard: 'none',
    users: 'none',
    spbu: 'none',
    sales: 'full',
    deliveries: 'limited',
    deposits: 'limited',
    prices: 'read-only',
    reports: 'limited',
    attendance: 'full',
    adjustments: 'limited',
    audit: 'none',
    prediction: 'none',
    notifications: 'read-only'
  }
};

// Get user permission level for a specific resource
export const getUserPermission = (user: any, resource: PermissionKey): PermissionLevel => {
  if (!user || !user.role || !Array.isArray(user.role)) return 'none';
  
  // Check each role the user has
  for (const roleName of user.role) {
    // Handle potential whitespace or case issues
    const cleanRoleName = typeof roleName === 'string' ? roleName.trim() : String(roleName);
    
    const rolePermissions = rolesPermissions[cleanRoleName];
    if (rolePermissions && rolePermissions[resource]) {
      return rolePermissions[resource];
    }
  }
  
  return 'none';
};

// Check if user has full access to a resource
export const hasFullAccess = (user: any, resource: PermissionKey): boolean => {
  return getUserPermission(user, resource) === 'full';
};

// Check if user has read-only access to a resource
export const hasReadOnlyAccess = (user: any, resource: PermissionKey): boolean => {
  const permission = getUserPermission(user, resource);
  return permission === 'full' || permission === 'read-only';
};

// Check if user has limited access to a resource
export const hasLimitedAccess = (user: any, resource: PermissionKey): boolean => {
  const permission = getUserPermission(user, resource);
  return permission === 'full' || permission === 'read-only' || permission === 'limited';
};

// Check if user has any access to a resource
export const hasAccess = (user: any, resource: PermissionKey | string): boolean => {
  // If resource is a string, try to cast it to PermissionKey
  if (typeof resource === 'string') {
    // Check if it's a valid PermissionKey
    const validKeys = [
      'dashboard', 'users', 'spbu', 'sales', 'deliveries', 'deposits', 
      'prices', 'reports', 'attendance', 'adjustments', 'audit', 'prediction'
    ] as const;
    
    if (validKeys.includes(resource as PermissionKey)) {
      return getUserPermission(user, resource as PermissionKey) !== 'none';
    }
    
    // For unknown resources, return true to be safe
    return true;
  }
  
  return getUserPermission(user, resource) !== 'none';
};
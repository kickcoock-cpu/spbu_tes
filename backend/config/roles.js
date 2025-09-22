// Role-based permissions configuration based on MENU_RBAC.md

const roles = {
  'Super Admin': {
    dashboard: 'full',
    users: 'full', // Create, Read, Update, Delete
    spbu: 'full', // Create, Read, Update, Delete
    sales: 'none',
    deliveries: 'full', // Create, Read, Update, Approve/Confirm
    deposits: 'full', // Create, Read, Update, Approve/Reject
    prices: 'full', // Create, Read, Update
    reports: 'full',
    attendance: 'none',
    adjustments: 'full', // Create, Read, Update, Approve/Reject
    audit: 'full',
    prediction: 'full',
    tanks: 'full', // Create, Read, Update, Delete
    notification: 'full' // Create, Read, Update, Delete
  },
  'Admin': {
    dashboard: 'full',
    users: 'read-only',
    spbu: 'read-only',
    sales: 'none',
    deliveries: 'full', // Create, Read, Update, Approve/Confirm
    deposits: 'full', // Create, Read, Update, Approve/Reject
    prices: 'full', // Create, Read, Update for their SPBU
    reports: 'full', // SPBU-specific reports
    attendance: 'none',
    adjustments: 'full', // Create, Read, Update, Approve/Reject for their SPBU
    audit: 'read-only',
    prediction: 'read-only',
    tanks: 'read-only', // Read-only access to tanks from their SPBU
    notification: 'full' // Create, Read, Update, Delete
  },
  'Operator': {
    dashboard: 'none',
    users: 'none',
    spbu: 'none',
    sales: 'full', // Create sales transactions
    deliveries: 'limited', // Confirm deliveries
    deposits: 'limited', // Create deposits
    prices: 'read-only',
    reports: 'limited', // Limited report access
    attendance: 'none', // Check-in/Check-out access
    adjustments: 'limited', // Create adjustment requests
    audit: 'none',
    prediction: 'none',
    tanks: 'read-only', // Read-only access to tanks
    notification: 'read-only' // Read-only access to notification
  }
};

module.exports = roles;
const rolesConfig = require('../config/roles');

// @desc    Get menu structure based on user role
// @route   GET /api/menu
// @access  Private
const getMenu = async (req, res) => {
  try {
    // Get user role from the authenticated user
    const userRole = req.user.Role ? req.user.Role.name : 'Operator';
    
    // Get permissions for the user's role
    const rolePermissions = rolesConfig[userRole] || {};
    
    // Define the complete menu structure with icons and routes
    const fullMenu = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/',
        permission: 'dashboard'
      },
      {
        id: 'users',
        label: 'Users Management',
        icon: 'group',
        route: '/users',
        permission: 'users',
      },
      {
        id: 'spbu',
        label: 'SPBU Management',
        icon: 'business',
        route: '/spbu',
        permission: 'spbu',
      },
      {
        id: 'tanks',
        label: 'Tanks',
        icon: 'local_gas_station', // Icon untuk tangki
        route: '/tanks',
        permission: 'tanks',
      },
      {
        id: 'sales',
        label: 'Sales',
        icon: 'shopping_cart',
        route: '/sales',
        permission: 'sales',
      },
      {
        id: 'deliveries',
        label: 'Deliveries',
        icon: 'local_shipping',
        route: '/deliveries',
        permission: 'deliveries',
      },
      {
        id: 'deposits',
        label: 'Deposits',
        icon: 'account_balance',
        route: '/deposits',
        permission: 'deposits',
      },
      {
        id: 'prices',
        label: 'Prices',
        icon: 'tag', // Mengganti price_change dengan tag
        route: '/prices',
        permission: 'prices',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'bar_chart',
        route: '/reports',
        permission: 'reports',
        submenu: [
          {
            id: 'reports-sales',
            label: 'Sales Report',
            icon: 'show_chart', // Mengganti bar_chart dengan show_chart
            route: '/reports/sales',
          },
          {
            id: 'reports-deliveries',
            label: 'Deliveries Report',
            icon: 'local_shipping',
            route: '/reports/deliveries',
          },
          {
            id: 'reports-deposits',
            label: 'Deposits Report',
            icon: 'account_balance',
            route: '/reports/deposits',
          },
          {
            id: 'reports-attendance',
            label: 'Attendance Report',
            icon: 'event_available',
            route: '/reports/attendance',
          },
           {
            id: 'reports-adjustment',
            label: 'Reports Adjustment',
            icon: 'fuel',
            route: '/reports/adjustment',
          },
          {
            id: 'reports-ledger',
            label: 'Ledger Report',
            icon: 'book',
            route: '/reports/ledger',
          }
        ]
      },
      {
        id: 'adjustments',
        label: 'Adjustments',
        icon: 'settings',
        route: '/adjustments',
        permission: 'adjustments',
      },
      {
        id: 'audit',
        label: 'Audit Logs',
        icon: 'history',
        route: '/audit',
        permission: 'audit',
      },
      {
        id: 'prediction',
        label: 'Predictions',
        icon: 'trending_up',
        route: '/prediction',
        permission: 'prediction',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'bell',
        route: '/notifications',
        permission: 'notifications',
      }
    ];
      
    // Filter menu based on user permissions
    const filteredMenu = fullMenu.filter(item => {
      // If user has full access to this menu item
      if (rolePermissions[item.permission] === 'full') {
        return true;
      }
      
      // If user has read-only access and the menu item doesn't require full access
      if (rolePermissions[item.permission] === 'read-only') {
        return true;
      }
      
      // If user has limited access and the menu item allows limited access
      if (rolePermissions[item.permission] === 'limited') {
        return true;
      }
      
      // No access
      return false;
    }).map(item => {
      // Clone the item to avoid modifying the original
      const filteredItem = { ...item };
      
      // If user has read-only access, mark the item as read-only
      if (rolePermissions[item.permission] === 'read-only') {
        filteredItem.readOnly = true;
      }
      
      // If user has limited access, mark the item as limited
      if (rolePermissions[item.permission] === 'limited') {
        filteredItem.limited = true;
      }
      
      // Filter submenu items based on permissions
      if (item.submenu) {
        filteredItem.submenu = item.submenu.filter(subItem => {
          // For submenu items, we check if the parent menu is accessible
          // In a more complex system, we might have specific permissions for submenu items
          return rolePermissions[item.permission] !== 'none';
        });
      }
      
      return filteredItem;
    });

    res.status(200).json({
      success: true,
      data: filteredMenu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getMenu
};
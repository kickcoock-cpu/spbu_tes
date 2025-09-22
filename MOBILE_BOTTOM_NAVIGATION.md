# Mobile Bottom Navigation Implementation

This document explains how the mobile bottom navigation works in the application, specifically for the operator role.

## Overview

The mobile bottom navigation provides a streamlined navigation experience for mobile users, particularly operators who primarily work with sales, deliveries, and deposits.

## Implementation Details

### Components

1. **BottomNavigation Component** (`/src/components/layout/bottom-navigation.tsx`)
   - Dynamically filters navigation items based on user roles and permissions
   - Uses RBAC (Role-Based Access Control) to determine which items to show
   - Highlights the active route based on the current location

2. **MobileLayout Component** (`/src/components/layout/mobile-layout.tsx`)
   - Integrates the BottomNavigation component
   - Adds padding to the main content area to prevent overlap with the navigation

### Navigation Items for Operator Role

1. **Home** - Dashboard view
2. **Sales** - Sales management (primary function for operators)
3. **Deliveries** - Delivery tracking (limited access for operators)
4. **Deposits** - Deposit management (limited access for operators)
5. **Profile** - User settings and profile management

### Permissions

The navigation items are filtered based on the operator's permissions as defined in the RBAC system:

```typescript
// Operator permissions from rbac.ts
'Operator': {
  dashboard: 'full',
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
  prediction: 'none'
}
```

## How It Works

1. When a user logs in, their role is determined from their JWT token
2. The BottomNavigation component checks each navigation item against:
   - The user's role (must be in the item's allowed roles)
   - The user's permissions (must have access to the resource)
3. Only items that pass both checks are displayed
4. The active route is highlighted based on the current URL

## Customization

To add or modify navigation items:

1. Edit the `navItems` array in `bottom-navigation.tsx`
2. Specify:
   - `title`: Display name
   - `href`: Link path
   - `icon`: Lucide React icon component
   - `roles`: Array of roles that can see this item
   - `permissionKey`: (Optional) RBAC permission key for more granular control

Example:
```typescript
{
  title: 'Reports',
  href: '/reports',
  icon: <BarChart3 className="h-5 w-5" />,
  roles: ['Super Admin', 'Admin', 'Operator'],
  permissionKey: 'reports'
}
```

## Styling

The bottom navigation is only visible on mobile devices (screen width < 768px) due to the `md:hidden` class.

The padding at the bottom of the main content (`pb-16` in MobileLayout and `pb-20` in mobile sales list) ensures content isn't hidden behind the navigation bar.
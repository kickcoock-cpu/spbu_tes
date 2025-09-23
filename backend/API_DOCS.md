# SPBU Management System API Documentation

## Overview
This document provides detailed information about the RESTful API endpoints for the SPBU Management System. The system implements Role-Based Access Control (RBAC) to ensure that users can only access resources and perform actions according to their roles. The system now uses MySQL as the database instead of MongoDB. Users can now log in using either their email or username.

## Authentication
Most endpoints require authentication via JWT tokens. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained by registering (Super Admin only) or logging in.

## Seeded Data for Testing
When using the database seeders, the following test accounts are available:
- **Super Admin**: superadmin@spbu.com / Pertamina1*
- **Admins**: admin1@spbu.com, admin2@spbu.com, admin3@spbu.com / Pertamina1*
- **Operators**: operator1a@spbu.com, operator1b@spbu.com, etc. / Pertamina1*

## Roles and Permissions

### Super Admin
- Full access across all SPBUs and system
- Can create/delete SPBUs
- Can manage all users
- Full access to all modules

### Admin
- Manage single SPBU: tanks, price, deliveries, approvals
- Read-only access to Users and SPBU management
- Full access to deliveries, deposits, and adjustments for their SPBU
- Read-only access to sales, attendance, audit, and prediction

### Operator
- Perform sales via pump
- Confirm deliveries
- Create deposits
- Read-only access to prices
- Check-in/Check-out access
- Create adjustment requests
- Limited report access

## API Endpoints

### Authentication
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/users/login` | Login user with email or username | All |
| POST | `/api/users/register` | Register user | Super Admin |
| GET | `/api/users/me` | Get current user profile | All |

### Menu
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/menu` | Get menu structure based on user role | All |

### Dashboard
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/dashboard` | Get dashboard data | All |

### Users Management
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users/me` | Get current user profile | All |
| GET | `/api/users` | Get all users | Super Admin, Admin |
| GET | `/api/users/:id` | Get user by ID | Super Admin, Admin |
| PUT | `/api/users/:id` | Update user | Super Admin |
| DELETE | `/api/users/:id` | Delete user | Super Admin |

### SPBU Management
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/spbu` | Create SPBU | Super Admin |
| GET | `/api/spbu` | Get all SPBUs | Super Admin, Admin |
| GET | `/api/spbu/:id` | Get SPBU by ID | Super Admin, Admin |
| PUT | `/api/spbu/:id` | Update SPBU | Super Admin |
| DELETE | `/api/spbu/:id` | Delete SPBU | Super Admin |

### Sales
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/sales` | Create sale transaction | Operator |
| GET | `/api/sales` | Get all sales | Super Admin, Admin |
| GET | `/api/sales/:id` | Get sale by ID | Super Admin, Admin |

### Deliveries
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/deliveries` | Create delivery | Super Admin, Admin |
| GET | `/api/deliveries` | Get all deliveries | Super Admin, Admin |
| GET | `/api/deliveries/:id` | Get delivery by ID | Super Admin, Admin |
| PUT | `/api/deliveries/:id` | Update delivery | Super Admin, Admin |
| PUT | `/api/deliveries/:id/confirm` | Confirm delivery | Super Admin, Admin, Operator |
| PUT | `/api/deliveries/:id/approve` | Approve delivery | Super Admin, Admin |

### Deposits
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/deposits` | Create deposit | Super Admin, Admin, Operator |
| GET | `/api/deposits` | Get all deposits | Super Admin, Admin |
| GET | `/api/deposits/:id` | Get deposit by ID | Super Admin, Admin |
| PUT | `/api/deposits/:id` | Update deposit | Super Admin, Admin |
| PUT | `/api/deposits/:id/approve` | Approve deposit | Super Admin, Admin |
| PUT | `/api/deposits/:id/reject` | Reject deposit | Super Admin, Admin |

### Prices
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/prices` | Create price | Super Admin, Admin |
| GET | `/api/prices` | Get all prices | All |
| GET | `/api/prices/:id` | Get price by ID | All |
| PUT | `/api/prices/:id` | Update price | Super Admin, Admin |

### Reports
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/reports/sales` | Get sales report | Super Admin, Admin, Operator |
| GET | `/api/reports/deliveries` | Get deliveries report | Super Admin, Admin, Operator |
| GET | `/api/reports/deposits` | Get deposits report | Super Admin, Admin, Operator |
| GET | `/api/reports/attendance` | Get attendance report | Super Admin, Admin, Operator |

### Attendance
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/attendance/check-in` | Check in | Operator |
| POST | `/api/attendance/check-out` | Check out | Operator |
| GET | `/api/attendance` | Get attendance records | All |

### Adjustments
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/adjustments` | Create adjustment request | Super Admin, Admin, Operator |
| GET | `/api/adjustments` | Get all adjustments | Super Admin, Admin |
| GET | `/api/adjustments/:id` | Get adjustment by ID | Super Admin, Admin |
| PUT | `/api/adjustments/:id` | Update adjustment | Super Admin, Admin |
| PUT | `/api/adjustments/:id/approve` | Approve adjustment | Super Admin, Admin |
| PUT | `/api/adjustments/:id/reject` | Reject adjustment | Super Admin, Admin |

### Audit
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/audit` | Get all audit logs | Super Admin, Admin |
| GET | `/api/audit/:id` | Get audit log by ID | Super Admin, Admin |

### Prediction
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/prediction/sales` | Get sales prediction | Super Admin, Admin |
| GET | `/api/prediction/deliveries` | Get deliveries prediction | Super Admin, Admin |
| GET | `/api/prediction/demand` | Get demand prediction | Super Admin, Admin |

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development mode only)"
}
```

## Success Responses
All success responses follow this format:
```json
{
  "success": true,
  "data": {},
  "count": 0
}
```

The `count` field is included in list responses to indicate the number of items returned.

## Database Schema
For detailed information about the database structure, please refer to the `database/schema.sql` and `database/erd.md` files.
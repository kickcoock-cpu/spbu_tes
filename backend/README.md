# SPBU Management System API

This is the backend API for the SPBU Management System with Role-Based Access Control (RBAC). The system now uses MySQL as the database instead of MongoDB.

## Table of Contents
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Roles and Permissions](#roles-and-permissions)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the MySQL database (see Database Setup section)
4. Create a `.env` file based on the environment variables section below
5. Run database migrations and seeds:
   ```bash
   npm run db:migrate
   npm run db:seed:all
   ```
6. Start the server:
   ```bash
   npm run dev
   ```

## Database Setup

### Option 1: Using Sequelize Migrations (Recommended)
1. Create a MySQL database named `spbu_db`
2. Run migrations:
   ```bash
   npm run db:migrate
   ```
3. Run seeders to populate initial data:
   ```bash
   npm run db:seed:all
   ```

### Option 2: Using SQL Schema
1. Create a MySQL database named `spbu_db`
2. Execute the SQL schema from `database/schema.sql` to create tables and initial data
3. Ensure your MySQL server is running

## Seeded Data
The database seeders will populate the database with the following dummy data:
- **5 SPBUs** with realistic locations and codes
- **10 Users** including 1 Super Admin, 3 Admins, and 6 Operators
- **200 Sales** records across the SPBUs
- **50 Deliveries** with various statuses
- **80 Deposits** with different payment methods
- **18 Prices** (global and SPBU-specific)
- **180 Attendance** records for operators
- **40 Adjustments** requests
- **100 Audit Logs** for tracking activities

All users are created with the password: `password123`

## Environment Variables

- `PORT` - Port for the server (default: 3000)
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - MySQL database name (default: spbu_db)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password (default: empty)
- `JWT_SECRET` - Secret key for JWT tokens
- `SYNC_DATABASE` - Set to true to auto-sync Sequelize models (default: false)

## Roles and Permissions

### Super Admin
- Full access across all SPBUs and system

### Admin
- Manage single SPBU: tanks, price, deliveries, approvals

### Operator
- Perform sales via pump, confirm deliveries, deposits

## API Endpoints

### Authentication
- `POST /api/users/register` - Register user (Super Admin only)
- `POST /api/users/login` - Login user

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Users Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Super Admin only)
- `DELETE /api/users/:id` - Delete user (Super Admin only)

### SPBU Management
- `POST /api/spbu` - Create SPBU (Super Admin only)
- `GET /api/spbu` - Get all SPBUs
- `GET /api/spbu/:id` - Get SPBU by ID
- `PUT /api/spbu/:id` - Update SPBU (Super Admin only)
- `DELETE /api/spbu/:id` - Delete SPBU (Super Admin only)

### Sales
- `POST /api/sales` - Create sale transaction (Operator only)
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID

### Deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries` - Get all deliveries
- `GET /api/deliveries/:id` - Get delivery by ID
- `PUT /api/deliveries/:id` - Update delivery
- `PUT /api/deliveries/:id/confirm` - Confirm delivery
- `PUT /api/deliveries/:id/approve` - Approve delivery

### Deposits
- `POST /api/deposits` - Create deposit
- `GET /api/deposits` - Get all deposits
- `GET /api/deposits/:id` - Get deposit by ID
- `PUT /api/deposits/:id` - Update deposit
- `PUT /api/deposits/:id/approve` - Approve deposit
- `PUT /api/deposits/:id/reject` - Reject deposit

### Prices
- `POST /api/prices` - Create price
- `GET /api/prices` - Get all prices
- `GET /api/prices/:id` - Get price by ID
- `PUT /api/prices/:id` - Update price

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/deliveries` - Get deliveries report
- `GET /api/reports/deposits` - Get deposits report
- `GET /api/reports/attendance` - Get attendance report

### Attendance
- `POST /api/attendance/check-in` - Check in (Operator only)
- `POST /api/attendance/check-out` - Check out (Operator only)
- `GET /api/attendance` - Get attendance records

### Adjustments
- `POST /api/adjustments` - Create adjustment request
- `GET /api/adjustments` - Get all adjustments
- `GET /api/adjustments/:id` - Get adjustment by ID
- `PUT /api/adjustments/:id` - Update adjustment
- `PUT /api/adjustments/:id/approve` - Approve adjustment
- `PUT /api/adjustments/:id/reject` - Reject adjustment

### Audit
- `GET /api/audit` - Get all audit logs
- `GET /api/audit/:id` - Get audit log by ID

### Prediction
- `GET /api/prediction/sales` - Get sales prediction
- `GET /api/prediction/deliveries` - Get deliveries prediction
- `GET /api/prediction/demand` - Get demand prediction

## Authentication

Most endpoints require authentication. To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are received when logging in or registering.

## Network Access

The backend server can be accessed from other devices on the same network. By default, the server binds to all network interfaces (`0.0.0.0`) and listens on port 3000.

To find your network IP address:
```bash
npm run network
```

This will display all available IP addresses where the backend can be accessed.

### Accessing from Other Devices

1. Make sure both devices are on the same network (Wi-Fi or LAN)
2. Find your machine's IP address using the `npm run network` command
3. On the other device, access the backend using: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

### Troubleshooting

If you can't access the backend from other devices:

1. Check your firewall settings - make sure port 3000 is allowed
2. Verify both devices are on the same network
3. Confirm the backend is running and shows the network IP addresses
4. Try accessing `http://localhost:3000` from the same machine to verify the backend is working
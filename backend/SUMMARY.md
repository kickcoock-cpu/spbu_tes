# SPBU Management System - Backend Implementation

## Overview
This project implements a complete backend API for an SPBU (Standardisasi Pelayanan Bahan Bakar Umum / Standardized Fuel Service Station) management system with Role-Based Access Control (RBAC). The system now uses MySQL as the database instead of MongoDB and supports three user roles with different permission levels as specified in the MENU_RBAC.md requirements.

## Technologies Used
- Node.js with Express.js framework
- MySQL with Sequelize ORM
- JSON Web Tokens (JWT) for authentication
- Bcrypt.js for password hashing
- Jest for testing

## Project Structure
```
├── config/
│   ├── config.js      # Sequelize configuration
│   ├── db.js          # Database connection
│   └── roles.js       # Role permissions configuration
├── controllers/       # Request handlers for each module
├── database/          # Database schema and documentation
│   ├── schema.sql     # SQL schema for database creation
│   └── erd.md         # Entity Relationship Diagram
├── migrations/        # Sequelize migration files
├── middleware/        # Authentication and authorization middleware
├── models/            # Sequelize data models
├── routes/            # API route definitions
├── seeders/           # Sequelize seed files
├── __tests__/         # Test files
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── .sequelizerc       # Sequelize CLI configuration
├── index.js           # Main application entry point
├── package.json       # Project dependencies and scripts
├── README.md          # Project documentation
├── API_DOCS.md        # Detailed API documentation
└── SUMMARY.md         # This file
```

## Implemented Modules

### 1. Authentication & Authorization
- JWT-based authentication system
- Role-based access control middleware
- Registration (Super Admin only) and login endpoints

### 2. Dashboard
- Role-specific dashboard data
- Access for all user roles

### 3. Users Management
- Full CRUD operations (Super Admin)
- Read-only access (Admin)
- No access (Operator)

### 4. SPBU Management
- Full CRUD operations (Super Admin)
- Read-only access (Admin)
- No access (Operator)

### 5. Sales
- Create sales transactions (Operator)
- Read-only access (Super Admin, Admin)
- No access (Operator for management)

### 6. Deliveries
- Full access (Super Admin, Admin)
- Confirm-only access (Operator)

### 7. Deposits
- Full access (Super Admin, Admin)
- Create-only access (Operator)

### 8. Prices
- Full access (Super Admin, Admin)
- Read-only access (Operator)

### 9. Reports
- Full access (Super Admin)
- SPBU-specific access (Admin)
- Limited access (Operator)

### 10. Attendance
- Check-in/Check-out (Operator)
- Read-only access (Super Admin, Admin)

### 11. Adjustments
- Full access (Super Admin, Admin)
- Create requests only (Operator)

### 12. Audit
- Full access (Super Admin)
- Read-only access (Admin)
- No access (Operator)

### 13. Prediction
- Full access (Super Admin)
- Read-only access (Admin)
- No access (Operator)

## Role Permissions Summary

| Module | Super Admin | Admin | Operator |
|--------|-------------|-------|----------|
| Dashboard | Full | Full | Full |
| Users | Full | Read-only | None |
| SPBU | Full | Read-only | None |
| Sales | Read-only | Read-only | Full |
| Deliveries | Full | Full | Confirm only |
| Deposits | Full | Full | Create only |
| Prices | Full | Full | Read-only |
| Reports | Full | SPBU-specific | Limited |
| Attendance | Read-only | Read-only | Check-in/out |
| Adjustments | Full | Full | Create requests |
| Audit | Full | Read-only | None |
| Prediction | Full | Read-only | None |

## API Documentation
Detailed API documentation is available in `API_DOCS.md` which includes:
- Endpoint specifications with HTTP methods
- Required roles for each endpoint
- Request/response formats
- Error handling information

## Database Schema
The database schema is defined in `database/schema.sql` and includes:
- 10 main tables with proper relationships
- Indexes for optimized queries
- Initial data for roles
- Detailed ERD in `database/erd.md`

## Database Migrations
The project uses Sequelize migrations for database version control:
- Migration files in `migrations/` directory
- Seed files in `seeders/` directory
- Sequelize CLI configuration in `.sequelizerc`

## Seeded Data
The database seeders will populate the database with comprehensive dummy data:
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

## Testing
- Project structure validation tests
- Unit tests for core functionality (can be expanded)

## How to Run
1. Install dependencies: `npm install`
2. Set up MySQL database
3. Set up environment variables in `.env` file
4. Run database migrations and seeds:
   ```bash
   npm run db:migrate
   npm run db:seed:all
   ```
5. Start the development server: `npm run dev`
6. Run tests: `npm test`

## Future Enhancements
1. Implement data validation for all endpoints
2. Add more comprehensive test coverage
3. Implement data population scripts for initial setup
4. Add input sanitization and security enhancements
5. Implement pagination for list endpoints
6. Add data filtering and sorting capabilities
7. Implement file upload functionality for reports
8. Add real-time notifications for status changes
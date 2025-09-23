# Password Standardization Documentation

## Overview
This document explains the password standardization effort to ensure consistency across all seed files, documentation, and test scripts in the SPBU Management System.

## Standardized Password
All user accounts in the system now use the same standardized password:
```
Pertamina1*
```

## Affected Files
The following files have been updated to use the standardized password:

### Seed Files
1. `backend/seeders/20230101000002-users-fixed.js` - New unified seed file
2. `backend/seeders/20230101000002-users.js` - Original seed file (using 'Pertamina1*' instead of 'password123')
3. `backend/seeders/supabase-seeder.js` - Supabase seeder file

### Documentation
1. `backend/README.md` - Updated seeded data section
2. `backend/API_DOCS.md` - Updated seeded data for testing section

### Test Scripts
1. `backend/scripts/live-sale-test.js` - Updated test user password
2. `backend/scripts/sale-test.js` - Updated test operator password

## Benefits
1. **Consistency**: All seed files now use the same password
2. **Clarity**: Documentation clearly states the standardized password
3. **Maintainability**: Easier to remember and use one standard password
4. **Deployment Consistency**: Matches the password used in deployment documentation

## Testing
After applying these changes, you can log in with any of the following credentials:

### Super Admin
- Username: `superadmin`
- Email: `superadmin@spbu.com`
- Password: `Pertamina1*`

### Admins
- Username: `admin1`, `admin2`, `admin3`
- Emails: `admin1@spbu.com`, `admin2@spbu.com`, `admin3@spbu.com`
- Password: `Pertamina1*`

### Operators
- Usernames: `operator1a`, `operator1b`, `operator2a`, `operator2b`, etc.
- Emails: `operator1a@spbu.com`, `operator1b@spbu.com`, etc.
- Password: `Pertamina1*`

## Deployment
The standardized password `Pertamina1*` matches the password used in the Vercel deployment configuration, ensuring consistency between development and production environments.
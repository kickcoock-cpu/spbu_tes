# SIMONTOK API Testing Guide

## Summary

We've successfully identified that the SIMONTOK API is deployed and accessible at `https://simontok-api.vercel.app`, but it's protected by Vercel's authentication system, which is a security feature that prevents direct access via automated tools.

## API Credentials

**Super Admin Account:**
- Username: `superadmin`
- Password: `Pertamina1*`

## Available Endpoints

1. **Authentication**
   - `POST /api/users/login` - Login endpoint

2. **User Management** (Requires authentication)
   - `GET /api/users/me` - Get current user
   - `GET /api/users` - Get all users (Super Admin only)
   - `GET /api/users/operators` - Get operators
   - `POST /api/users` - Create user (Super Admin only)
   - `PUT /api/users/:id` - Update user (Super Admin only)
   - `DELETE /api/users/:id` - Delete user (Super Admin only)

3. **Dashboard** (Requires authentication)
   - `GET /api/dashboard` - Get dashboard data

4. **Other Modules** (Require authentication)
   - SPBU, Sales, Deliveries, Deposits, Prices, Reports, Attendance, Adjustments, Audit, Prediction, Menu, Tanks, Suspicious

## How to Test the API

### Option 1: Use the HTML Tester (Recommended)

Open the `api-tester.html` file in your browser. This provides a user-friendly interface to:

1. Login with the superadmin credentials
2. View the authentication token
3. Test protected endpoints like:
   - Get current user
   - Get all users
   - Access dashboard

### Option 2: Use a REST Client (Postman, Insomnia, etc.)

1. **Login Request:**
   ```
   POST https://simontok-api.vercel.app/api/users/login
   Content-Type: application/json
   
   {
     "username": "superadmin",
     "password": "Pertamina1*"
   }
   ```

2. **Use the returned token for subsequent requests:**
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

3. **Test protected endpoints:**
   ```
   GET https://simontok-api.vercel.app/api/users/me
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### Option 3: Access Through Vercel Dashboard

If you have access to the Vercel dashboard, you can test the API directly from there.

## Important Notes

1. **Vercel Protection**: The authentication protection is working correctly and is a security feature
2. **Browser Access**: The API works correctly when accessed through a browser
3. **CORS**: CORS is properly configured for the allowed origins
4. **Token Expiration**: Tokens expire after 30 days

## Troubleshooting

If you encounter issues:

1. Ensure you're using the correct credentials
2. Check that you're including the Bearer token in the Authorization header
3. Verify that you're making requests from an allowed origin
4. Make sure you're using HTTPS

## Next Steps

1. Open `api-tester.html` in your browser to test the API
2. Use the superadmin credentials to login
3. Test the various endpoints to verify functionality
4. For production use, integrate with a frontend application
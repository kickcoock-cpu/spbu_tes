# Deploying Backend to Vercel with Supabase

## Steps to deploy:

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     ```
     DB_DIALECT=postgres
     DB_HOST=db.eqwnpfuuwpdsacyvdrvj.supabase.co
     DB_PORT=5432
     DB_NAME=postgres
     DB_USER=postgres
     DB_PASSWORD=Pertamina1*
     JWT_SECRET=r+Zkdof1G2kxC3QjRKWBWljGMyyBTP7Wf2mp/NW2ymDbJgFDl94w6vpuEIL4xr30XpAYI8ClmoqgAYUr3BeQQQ==
     NODE_ENV=production
     SYNC_DATABASE=false
     ```

2. **Deploy to Vercel:**
   - Push your changes to your GitHub repository
   - Vercel will automatically deploy your application

3. **Verify Deployment:**
   - Visit your deployed URL + `/health` to check if the server is running
   - Check the Vercel logs for any database connection errors

## Troubleshooting:

1. **If you get "PostgreSQL driver not found" error:**
   - Make sure `pg` package is installed in your dependencies
   - Check your package.json to ensure it includes `"pg": "^8.16.3"`

2. **If you get SSL connection errors:**
   - Ensure the SSL configuration in db.js is correct
   - The dialectOptions should include:
     ```javascript
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: false
       }
     }
     ```

3. **If you get authentication errors:**
   - Verify your Supabase credentials are correct
   - Check that your Supabase database allows connections from Vercel

## Testing Connection:

You can test the connection locally by:
1. Creating a `.env.local` file with your Supabase credentials
2. Running `node test-vercel-supabase.js`
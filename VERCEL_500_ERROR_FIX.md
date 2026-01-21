# Fixing 500 Internal Server Error on Vercel

## Common Causes

### 1. Database Connection Issues (Most Likely)
The 500 error is likely due to database connection problems. Check:

**Environment Variables:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify these are set:
  ```
  DATABASE_URL=postgresql://user:password@host:port/database
  ```
  OR
  ```
  DB_USER=your_user
  DB_HOST=your_host
  DB_NAME=your_database
  DB_PASSWORD=your_password
  DB_PORT=5432
  ```

**Database Access:**
- Ensure your database allows connections from Vercel IPs
- Check database firewall settings
- Verify connection string is correct

### 2. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions → Logs
2. Look for error messages
3. Common errors:
   - `Connection refused` - Database not accessible
   - `password authentication failed` - Wrong credentials
   - `database does not exist` - Wrong database name
   - `relation "habits" does not exist` - Tables not created

### 3. Database Tables Not Created
If tables don't exist, you'll get 500 errors. Run the schema:

```sql
-- Connect to your database and run:
-- server/db/schema.sql
```

## Quick Fixes Applied

1. **Added Error Handling:**
   - Better error messages in API responses
   - Detailed error logging
   - Connection pool settings for serverless

2. **Connection Pool Optimization:**
   - `max: 1` connection for serverless
   - Timeout settings
   - SSL configuration for production

3. **Error Logging:**
   - Console errors now include more details
   - Database error codes included in responses

## Testing Steps

1. **Test Health Endpoint:**
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return: `{ status: 'ok', database: 'connected' }`

2. **Test Habits Endpoint:**
   ```
   https://your-app.vercel.app/api/habits
   ```
   Should return: Array of habits or empty array `[]`

3. **Check Function Logs:**
   - Vercel Dashboard → Functions → Logs
   - Look for specific error messages

## Environment Variables Checklist

✅ `DATABASE_URL` OR all of:
- ✅ `DB_USER`
- ✅ `DB_HOST`
- ✅ `DB_NAME`
- ✅ `DB_PASSWORD`
- ✅ `DB_PORT` (optional, defaults to 5432)

## Next Steps

1. **Verify Environment Variables** in Vercel Dashboard
2. **Check Function Logs** for specific error messages
3. **Test Database Connection** using the health endpoint
4. **Run Database Schema** if tables don't exist
5. **Redeploy** after fixing environment variables

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch completions` | Database connection failed | Check DATABASE_URL |
| `relation "habits" does not exist` | Tables not created | Run schema.sql |
| `password authentication failed` | Wrong password | Update DB_PASSWORD |
| `Connection refused` | Database not accessible | Check firewall/network |


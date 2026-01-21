# Vercel API Routes Fix

## Problem
API routes returning 404 on Vercel deployment.

## Solution
The API functions are now structured as individual serverless functions in the `api/` folder.

## File Structure
```
api/
  ├── habits.js          # Handles /api/habits/*
  ├── completions.js     # Handles /api/completions/*
  └── health.js          # Handles /api/health
```

## How It Works

1. **Vercel automatically detects** files in the `api/` folder as serverless functions
2. **File naming**: 
   - `api/habits.js` → handles `/api/habits` and `/api/habits/*`
   - `api/completions.js` → handles `/api/completions` and `/api/completions/*`
   - `api/health.js` → handles `/api/health`

3. **Express routing**: Each function creates an Express app and mounts the router at the correct path

## Environment Variables Required

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

**Option 1: Using DATABASE_URL (Recommended)**
```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Option 2: Using Individual Parameters**
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

## Testing

After deployment, test these endpoints:
- `https://your-app.vercel.app/api/health` - Should return `{ status: 'ok', database: 'connected' }`
- `https://your-app.vercel.app/api/habits` - Should return habits array
- `https://your-app.vercel.app/api/completions` - Should return completions array

## Troubleshooting

### 404 Errors
- Check that files are in `api/` folder (not `server/api/`)
- Verify file names match exactly: `habits.js`, `completions.js`, `health.js`
- Check Vercel function logs in dashboard

### Database Connection Errors
- Verify environment variables are set correctly
- Check database allows connections from Vercel IPs
- Test connection string locally

### CORS Errors
- CORS is configured in each API function
- Headers are set in `vercel.json`

## Next Steps

1. Commit and push these changes
2. Vercel will automatically redeploy
3. Check function logs if issues persist
4. Test API endpoints after deployment


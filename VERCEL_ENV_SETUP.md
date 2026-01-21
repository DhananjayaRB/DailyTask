# Setting Environment Variables in Vercel

## Your Database Credentials

Based on your requirements, add these environment variables in Vercel:

```
DB_USER=postgres
DB_HOST=20.204.119.48
DB_NAME=demo_task
DB_PASSWORD=resolve@2022
DB_PORT=5432
```

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Log in to your account
3. Select your project: **daily-task**

### 2. Navigate to Environment Variables
1. Click on your project
2. Go to **Settings** (in the top navigation)
3. Click on **Environment Variables** (in the left sidebar)

### 3. Add Each Variable
For each variable below, click **Add** and enter:

**Variable 1:**
- **Key:** `DB_USER`
- **Value:** `postgres`
- **Environment:** Select all (Production, Preview, Development)

**Variable 2:**
- **Key:** `DB_HOST`
- **Value:** `20.204.119.48`
- **Environment:** Select all

**Variable 3:**
- **Key:** `DB_NAME`
- **Value:** `demo_task`
- **Environment:** Select all

**Variable 4:**
- **Key:** `DB_PASSWORD`
- **Value:** `resolve@2022`
- **Environment:** Select all

**Variable 5:**
- **Key:** `DB_PORT`
- **Value:** `5432`
- **Environment:** Select all

### 4. Save and Redeploy
1. After adding all variables, they will be saved automatically
2. **IMPORTANT:** Environment variables require a new deployment to take effect
3. Go to **Deployments** tab
4. Click the **"..."** menu on the latest deployment
5. Click **Redeploy**
6. Or push a new commit to trigger automatic redeploy

## Verify Environment Variables

After redeploying, test the health endpoint:
```
https://your-app.vercel.app/api/health
```

The response should show:
```json
{
  "status": "ok",
  "database": "connected",
  "env": {
    "hasDbUser": true,
    "hasDbHost": true,
    "hasDbName": true
  }
}
```

## Troubleshooting

### Still Getting 127.0.0.1 Error?
1. **Check Variable Names:** Make sure they're exactly:
   - `DB_USER` (not `DATABASE_USER`)
   - `DB_HOST` (not `DATABASE_HOST`)
   - etc.

2. **Check Environments:** Make sure variables are added for **Production** environment

3. **Redeploy:** Environment variables only apply after redeployment

4. **Check Logs:** 
   - Vercel Dashboard → Functions → Logs
   - Look for "Database config:" log to see what's being used

### Database Connection Issues
- Verify database at `20.204.119.48:5432` is accessible from internet
- Check firewall allows connections from Vercel IPs
- Verify credentials are correct

## Quick Copy-Paste

If you want to add all at once, you can use Vercel CLI:

```bash
vercel env add DB_USER production
# Enter: postgres

vercel env add DB_HOST production
# Enter: 20.204.119.48

vercel env add DB_NAME production
# Enter: demo_task

vercel env add DB_PASSWORD production
# Enter: resolve@2022

vercel env add DB_PORT production
# Enter: 5432
```

Then redeploy:
```bash
vercel --prod
```


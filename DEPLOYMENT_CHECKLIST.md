# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables Setup
Add these in Vercel Dashboard → Settings → Environment Variables:

**Option A: Using DATABASE_URL (Recommended for Vercel Postgres)**
```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Option B: Using Individual Parameters**
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### 2. Database Setup
- [ ] Create PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
- [ ] Run database schema: `server/db/schema.sql`
- [ ] Verify database connection works

### 3. Git Repository
- [ ] Commit all changes
- [ ] Push to GitHub/GitLab/Bitbucket
- [ ] Verify repository is accessible

### 4. Vercel Project Configuration
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: **./** (root)
- [ ] Build Command: **npm run build**
- [ ] Output Directory: **dist**
- [ ] Install Command: **npm install**

## Deployment Steps

### Step 1: Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Select the repository

### Step 2: Configure Project
- Framework: Vite (auto-detected)
- Root Directory: `./`
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)

### Step 3: Add Environment Variables
Add all environment variables from the checklist above

### Step 4: Deploy
Click **Deploy** and wait for build to complete

### Step 5: Initialize Database
After deployment:
1. Connect to your database
2. Run `server/db/schema.sql` to create tables
3. Verify tables are created

### Step 6: Verify Deployment
- [ ] Visit your deployment URL
- [ ] Check `/api/health` endpoint
- [ ] Test creating a habit
- [ ] Test marking completions
- [ ] Verify all features work

## Post-Deployment

### Verify API Endpoints
- `/api/health` - Should return `{ status: 'ok', database: 'connected' }`
- `/api/habits` - Should return habits list
- `/api/completions` - Should return completions

### Common Issues

**Issue: Database Connection Failed**
- Check environment variables are set correctly
- Verify database allows connections from Vercel IPs
- Check database firewall settings

**Issue: API Routes Return 404**
- Verify `api/` folder structure is correct
- Check Vercel function logs
- Ensure routes are properly exported

**Issue: Build Fails**
- Check Node.js version (Vercel uses 18.x)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

## File Structure for Vercel

```
.
├── api/                    # Serverless functions
│   ├── habits/
│   │   └── index.js       # Habits API handler
│   ├── completions/
│   │   └── index.js       # Completions API handler
│   └── health.js          # Health check
├── server/                 # Shared backend code
│   ├── routes/            # Express routes
│   └── db/               # Database connection
├── src/                   # Frontend React app
├── public/               # Static assets
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Function Logs: Vercel Dashboard → Your Project → Functions → Logs


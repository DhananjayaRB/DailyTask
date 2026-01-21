# Vercel Deployment Guide

This guide will help you deploy the Daily Task Tracker application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. PostgreSQL database (can use Vercel Postgres, Supabase, or any PostgreSQL provider)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Database

### Option A: Use Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to your project → Storage → Create Database → Postgres
3. Copy the connection string

### Option B: Use External PostgreSQL
Use your existing PostgreSQL database (e.g., Supabase, Railway, AWS RDS, etc.)

## Step 2: Set Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

**OR** if using a connection string:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables (from Step 2)
5. Click **Deploy**

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Step 4: Initialize Database Schema

After deployment, you need to run the database schema:

### Option A: Using Vercel Postgres Dashboard
1. Go to your Vercel project → Storage → Postgres → Data
2. Use the SQL Editor to run `server/db/schema.sql`

### Option B: Using psql or Database Client
Connect to your database and run:
```sql
-- Run the schema file
\i server/db/schema.sql
```

### Option C: Using a Database Migration Tool
You can use tools like `pg-migrate` or run migrations via a one-time serverless function.

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Check the health endpoint: `https://your-app.vercel.app/api/health`
3. Test the application functionality

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_USER` | PostgreSQL username | Yes* |
| `DB_HOST` | PostgreSQL host | Yes* |
| `DB_NAME` | Database name | Yes* |
| `DB_PASSWORD` | PostgreSQL password | Yes* |
| `DB_PORT` | PostgreSQL port (default: 5432) | No |
| `DATABASE_URL` | Full connection string (alternative to above) | Yes* |

*Either use individual DB_* variables OR DATABASE_URL

## Troubleshooting

### Database Connection Issues
- Verify environment variables are set correctly
- Check database firewall allows Vercel IPs
- Ensure database is accessible from the internet (if not using Vercel Postgres)

### Build Errors
- Check Node.js version (Vercel uses Node 18.x by default)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Routes Not Working
- Ensure `api/` folder structure is correct
- Check Vercel function logs in dashboard
- Verify CORS headers are set correctly

## Project Structure for Vercel

```
.
├── api/              # Serverless functions
│   ├── index.js     # Main API handler
│   ├── habits.js    # Habits API
│   ├── completions.js # Completions API
│   └── health.js    # Health check
├── server/          # Backend code (shared)
│   ├── routes/      # Express routes
│   └── db/          # Database connection
├── src/             # Frontend React app
├── public/          # Static assets
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies
```

## Additional Notes

- The frontend is built as a static site and served by Vercel
- API routes are converted to serverless functions
- Database connection is pooled and reused across function invocations
- CORS is configured to allow frontend requests

## Support

For issues:
1. Check Vercel function logs in dashboard
2. Check database connection logs
3. Verify environment variables
4. Review build logs for errors


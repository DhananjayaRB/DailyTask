# Setup Guide

Follow these steps to set up the Daily Task Tracker application.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Database Setup

1. **Start PostgreSQL** (if not already running)

2. **Create the database:**
```bash
psql -U postgres
```

Then in the PostgreSQL prompt:
```sql
CREATE DATABASE dail_task;
\q
```

3. **Run the schema:**
```bash
psql -U postgres -d dail_task -f server/db/schema.sql
```

Or manually copy and paste the SQL from `server/db/schema.sql` into your PostgreSQL client.

## Step 2: Backend Setup

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
Create a file named `.env` in the `server` directory with:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dail_task
DB_PASSWORD=Resolve@321
DB_PORT=5432
PORT=3001
```

4. **Start the backend server:**
```bash
npm run dev
```

The server should start on `http://localhost:3001`. You should see:
```
🚀 Server running on http://localhost:3001
✅ Database connection successful
```

## Step 3: Frontend Setup

1. **Open a new terminal** and navigate to the project root

2. **Install dependencies:**
```bash
npm install
```

3. **Start the frontend:**
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

## Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Daily Task Tracker application with:
- Dashboard page with habit tracking
- Analytics page with progress insights
- Settings page to manage habits

## Troubleshooting

### Database Connection Error

If you see a database connection error:
1. Make sure PostgreSQL is running
2. Verify the database `dail_task` exists
3. Check your `.env` file has the correct credentials
4. Ensure the schema has been run (tables exist)

### Port Already in Use

If port 3001 or 5173 is already in use:
- Change `PORT` in `server/.env` for backend
- Change port in `vite.config.ts` for frontend (or use `npm run dev -- --port 5174`)

### CORS Errors

If you see CORS errors, make sure:
- Backend is running on port 3001
- Frontend is configured to use `http://localhost:3001` in `src/services/api.ts`

## Verification

To verify everything is working:

1. **Check backend health:**
   Visit `http://localhost:3001/api/health` - should return `{"status":"ok","database":"connected"}`

2. **Check frontend:**
   Visit `http://localhost:5173` - should show the application

3. **Test adding a habit:**
   - Click "+ Add Habit"
   - Fill in the form
   - Submit
   - Habit should appear in the list

4. **Test completion:**
   - Click a checkbox for today
   - It should turn green and save to database

## Next Steps

- Customize habits in the Settings page
- Track your daily progress
- View analytics to see your improvement over time

Enjoy tracking your habits! 🌱


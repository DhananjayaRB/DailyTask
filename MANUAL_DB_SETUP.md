# Manual Database Setup Guide

Follow these steps to manually set up your PostgreSQL database.

## Option 1: Using pgAdmin (GUI)

1. **Open pgAdmin** and connect to your PostgreSQL server

2. **Create the database:**
   - Right-click on "Databases" → "Create" → "Database"
   - Name: `dail_task`
   - Click "Save"

3. **Open Query Tool:**
   - Right-click on `dail_task` database → "Query Tool"

4. **Run the SQL script:**
   - Open `server/db/setup-manual.sql`
   - Copy all the SQL (skip the CREATE DATABASE line since you already created it)
   - Paste into Query Tool
   - Click "Execute" (F5)

## Option 2: Using psql (Command Line)

1. **Open PowerShell or Command Prompt**

2. **Create the database:**
```powershell
$env:PGPASSWORD="Resolve@321"
psql -U postgres -c "CREATE DATABASE dail_task;"
```

3. **Connect to the database:**
```powershell
psql -U postgres -d dail_task
```

4. **Run the SQL script:**
```powershell
\i server/db/setup-manual.sql
```

Or copy-paste the SQL from `server/db/setup-manual.sql` directly into psql.

## Option 3: Using DBeaver

1. **Open DBeaver** and connect to PostgreSQL

2. **Create the database:**
   - Right-click on your PostgreSQL connection → "SQL Editor" → "New SQL Script"
   - Run: `CREATE DATABASE dail_task;`
   - Refresh and connect to `dail_task` database

3. **Run the setup script:**
   - Open `server/db/setup-manual.sql`
   - Copy the SQL (skip CREATE DATABASE line)
   - Paste into SQL Editor
   - Execute (Ctrl+Enter)

## Step-by-Step SQL (Copy-Paste Ready)

If you prefer to run commands one by one, use `server/db/setup-step-by-step.sql`

### Quick Copy-Paste (All-in-One)

**After creating and connecting to `dail_task` database, run:**

```sql
-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    goal INTEGER NOT NULL DEFAULT 30,
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create completions table
CREATE TABLE IF NOT EXISTS completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);

-- Insert default habits
INSERT INTO habits (name, emoji, goal, color) VALUES
    ('Wake up at 05:00', '⏰', 30, 'blue'),
    ('Gym', '💪', 20, 'red'),
    ('Reading / Learning', '📚', 30, 'purple'),
    ('Budget Tracking', '💰', 30, 'green'),
    ('Project Work', '🎯', 25, 'orange'),
    ('No Alcohol', '🚫', 30, 'yellow'),
    ('Social Media Detox', '📵', 30, 'pink'),
    ('Goal Journaling', '📝', 30, 'indigo'),
    ('Cold Shower', '❄️', 30, 'cyan'),
    ('Meditation', '🧘', 30, 'teal');
```

## Verify Setup

Run these queries to verify everything is set up:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: habits, completions

-- Check habits were inserted
SELECT COUNT(*) FROM habits;
-- Should return: 10

-- View all habits
SELECT id, name, emoji, goal, color FROM habits ORDER BY id;
```

## Troubleshooting

### Database already exists
If you get "database already exists" error, just skip that step and connect to the existing database.

### Tables already exist
If tables already exist, the `CREATE TABLE IF NOT EXISTS` will skip creation. You can drop and recreate if needed:

```sql
DROP TABLE IF EXISTS completions CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
```

Then run the CREATE TABLE statements again.

### Connection Issues
Make sure PostgreSQL is running and your credentials are correct:
- User: `postgres`
- Password: `Resolve@321`
- Host: `localhost`
- Port: `5432`

## Next Steps

After database setup is complete:

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend (in a new terminal):
```bash
npm run dev
```

3. Open `http://localhost:5173` in your browser

Your Daily Task Tracker is ready! 🎉


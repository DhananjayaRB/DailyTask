# Quick Database Migration Guide

## Error: "column mobile_number does not exist"

This error means the database tables don't have the `mobile_number` column yet. Run the migration to fix it.

## Quick Fix - Choose One Method:

### Method 1: Run Migration Script (Easiest)

```bash
npm run migrate
```

Make sure your `.env` file or environment variables are set with database credentials:
- `DB_USER=postgres`
- `DB_HOST=20.204.119.48`
- `DB_NAME=demo_task`
- `DB_PASSWORD=resolve@2022`
- `DB_PORT=5432`

### Method 2: Run SQL Directly

Connect to your PostgreSQL database (using pgAdmin, DBeaver, psql, etc.) and run:

```sql
-- Add mobile_number to habits table
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Add mobile_number to completions table
ALTER TABLE completions 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_habits_mobile ON habits(mobile_number);
CREATE INDEX IF NOT EXISTS idx_completions_mobile ON completions(mobile_number);
CREATE INDEX IF NOT EXISTS idx_completions_mobile_date ON completions(mobile_number, date);

-- Update unique constraint
ALTER TABLE completions 
DROP CONSTRAINT IF EXISTS completions_habit_id_date_key;

ALTER TABLE completions 
ADD CONSTRAINT completions_habit_mobile_date_unique 
UNIQUE(habit_id, mobile_number, date);
```

### Method 3: Using psql Command Line

```bash
psql -h 20.204.119.48 -U postgres -d demo_task -f server/db/migration_add_mobile.sql
```

When prompted, enter password: `resolve@2022`

## Verify Migration

After running migration, verify it worked:

```sql
-- Check habits table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'habits' AND column_name = 'mobile_number';

-- Check completions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'completions' AND column_name = 'mobile_number';
```

Both queries should return 1 row each.

## After Migration

1. Restart your application
2. Try logging in with a new mobile number
3. Create habits and verify they're saved with mobile_number
4. Check completions are filtered by mobile_number

## Troubleshooting

### "relation does not exist"
- Make sure you're connected to the correct database (`demo_task`)
- Check table names are correct: `habits` and `completions`

### "permission denied"
- Make sure you're using the correct database user (`postgres`)
- Verify the user has ALTER TABLE permissions

### "constraint already exists"
- This is okay, the constraint might already exist
- The migration script handles this gracefully


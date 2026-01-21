# Mobile Number Setup Guide

## Database Migration Required

Before using the app with mobile number filtering, you need to run the database migration:

### Step 1: Run Migration SQL

Connect to your PostgreSQL database and run:

```sql
-- Add mobile_number to habits table
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Add mobile_number to completions table
ALTER TABLE completions 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Create indexes for faster queries by mobile number
CREATE INDEX IF NOT EXISTS idx_habits_mobile ON habits(mobile_number);
CREATE INDEX IF NOT EXISTS idx_completions_mobile ON completions(mobile_number);
CREATE INDEX IF NOT EXISTS idx_completions_mobile_date ON completions(mobile_number, date);

-- Update unique constraint for completions to include mobile_number
-- First, drop the old unique constraint if it exists
ALTER TABLE completions 
DROP CONSTRAINT IF EXISTS completions_habit_id_date_key;

-- Add new unique constraint with mobile_number
ALTER TABLE completions 
ADD CONSTRAINT completions_habit_mobile_date_unique 
UNIQUE(habit_id, mobile_number, date);
```

### Step 2: Verify Migration

Check that columns were added:

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

## Features Implemented

### 1. User Name Display
- ✅ User's name is displayed in the navigation bar (desktop view)
- ✅ Shows next to a user icon (👤)

### 2. Mobile Number Validation
- ✅ Prevents duplicate mobile numbers during registration
- ✅ Checks if mobile number exists before allowing login
- ✅ Shows error message if mobile number is already registered

### 3. Data Filtering by Mobile Number
- ✅ All habits are filtered by user's mobile number
- ✅ All completions are filtered by user's mobile number
- ✅ Statistics are filtered by user's mobile number
- ✅ Each user only sees their own data

### 4. Security
- ✅ API routes require mobile_number parameter
- ✅ Returns empty arrays if mobile_number is missing
- ✅ Prevents users from seeing other users' data

## How It Works

1. **Login**: User enters name, mobile number, and unique number
2. **Validation**: System checks if mobile number already exists
3. **Storage**: User data is stored in localStorage
4. **API Calls**: All API requests automatically include mobile_number
5. **Filtering**: Backend filters all data by mobile_number
6. **Display**: User sees only their own habits and completions

## API Changes

### Habits API
- `GET /api/habits` - Now requires `mobile_number` query parameter
- `POST /api/habits` - Now requires `mobile_number` in request body

### Completions API
- `GET /api/completions` - Now requires `mobile_number` query parameter
- `GET /api/completions/:habitId/:date` - Now requires `mobile_number` query parameter
- `POST /api/completions` - Now requires `mobile_number` in request body
- `GET /api/completions/stats/summary` - Now requires `mobile_number` query parameter

### Users API (New)
- `GET /api/users?mobile=1234567890` - Checks if mobile number exists

## Testing

After migration:

1. **Test Login**: Try registering with a new mobile number
2. **Test Duplicate**: Try registering with the same mobile number (should fail)
3. **Test Data**: Create habits and completions, verify they're user-specific
4. **Test Multiple Users**: Register with different mobile numbers, verify data isolation

## Troubleshooting

### "Mobile number is required" error
- Ensure mobile_number is being sent with API requests
- Check localStorage has user data with mobile number

### Data not showing
- Verify migration was run successfully
- Check mobile_number column exists in database
- Verify mobile_number is being sent in API requests

### Duplicate mobile validation not working
- Check `/api/users` endpoint is accessible
- Verify database has mobile_number column in habits table


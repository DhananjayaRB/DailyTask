-- ============================================
-- SIMPLE SQL TO ADD mobile_number COLUMNS
-- ============================================
-- Copy and paste this ENTIRE script into your PostgreSQL client
-- (pgAdmin, DBeaver, psql, etc.)
-- ============================================

-- Step 1: Add column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Step 2: Add column to completions table
ALTER TABLE completions ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Step 3: Create indexes (for better performance)
CREATE INDEX IF NOT EXISTS idx_habits_mobile ON habits(mobile_number);
CREATE INDEX IF NOT EXISTS idx_completions_mobile ON completions(mobile_number);
CREATE INDEX IF NOT EXISTS idx_completions_mobile_date ON completions(mobile_number, date);

-- Step 4: Drop old constraint (if it exists)
ALTER TABLE completions DROP CONSTRAINT IF EXISTS completions_habit_id_date_key;

-- Step 5: Add new unique constraint
ALTER TABLE completions DROP CONSTRAINT IF EXISTS completions_habit_mobile_date_unique;
ALTER TABLE completions ADD CONSTRAINT completions_habit_mobile_date_unique UNIQUE(habit_id, mobile_number, date);

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'mobile_number';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'completions' AND column_name = 'mobile_number';
-- ============================================


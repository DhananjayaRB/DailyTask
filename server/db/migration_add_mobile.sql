-- Migration: Add mobile_number column to habits and completions tables
-- Run this to update existing database schema

-- Add mobile_number to habits table
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Add mobile_number to completions table
ALTER TABLE completions 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Create index for faster queries by mobile number
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


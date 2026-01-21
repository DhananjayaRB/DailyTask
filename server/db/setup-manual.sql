-- ============================================
-- Daily Task Tracker - Manual Database Setup
-- ============================================
-- Run this script in your PostgreSQL client
-- (pgAdmin, DBeaver, psql, etc.)
-- ============================================

-- Step 1: Create the database (run this first, then connect to dail_task database)
-- If database already exists, you can skip this step
CREATE DATABASE dail_task;

-- ============================================
-- Step 2: Connect to the dail_task database
-- Make sure you're connected to dail_task before running the rest
-- ============================================

-- Step 3: Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    goal INTEGER NOT NULL DEFAULT 30,
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create completions table
CREATE TABLE IF NOT EXISTS completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, date)
);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);

-- Step 6: Insert default habits
-- Note: This will only insert if the habits don't already exist
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
    ('Meditation', '🧘', 30, 'teal')
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Queries (Optional - run to verify setup)
-- ============================================

-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check habits count
SELECT COUNT(*) as total_habits FROM habits;

-- View all habits
SELECT id, name, emoji, goal, color FROM habits ORDER BY id;

-- ============================================
-- Setup Complete!
-- ============================================


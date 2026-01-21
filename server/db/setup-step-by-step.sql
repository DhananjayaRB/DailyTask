-- ============================================
-- Daily Task Tracker - Step-by-Step Setup
-- ============================================
-- Copy and paste each section one at a time
-- ============================================

-- ============================================
-- STEP 1: Create Database
-- ============================================
-- Run this FIRST in your PostgreSQL client (connected to 'postgres' database)
-- ============================================

CREATE DATABASE dail_task;

-- ============================================
-- STEP 2: Switch to dail_task database
-- ============================================
-- In pgAdmin: Right-click and "Refresh", then connect to 'dail_task'
-- In psql: \c dail_task
-- In DBeaver: Switch connection to dail_task database
-- ============================================

-- ============================================
-- STEP 3: Create Habits Table
-- ============================================
-- Run this AFTER connecting to dail_task database
-- ============================================

CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    goal INTEGER NOT NULL DEFAULT 30,
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 4: Create Completions Table
-- ============================================

CREATE TABLE IF NOT EXISTS completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, date)
);

-- ============================================
-- STEP 5: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);

-- ============================================
-- STEP 6: Insert Default Habits
-- ============================================

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

-- ============================================
-- VERIFICATION (Optional)
-- ============================================
-- Run these to verify everything is set up correctly
-- ============================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count habits
SELECT COUNT(*) as total_habits FROM habits;

-- View all habits
SELECT id, name, emoji, goal, color FROM habits ORDER BY id;

-- ============================================
-- DONE! Your database is ready.
-- ============================================


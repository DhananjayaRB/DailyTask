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

-- Create index for faster queries
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
    ('Meditation', '🧘', 30, 'teal')
ON CONFLICT DO NOTHING;


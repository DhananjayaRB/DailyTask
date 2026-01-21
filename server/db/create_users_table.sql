-- Create users table to store user information for login
-- Run this SQL to create the users table

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    unique_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);

-- Add unique constraint on mobile_number
ALTER TABLE users ADD CONSTRAINT users_mobile_unique UNIQUE(mobile_number);


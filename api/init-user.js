// Vercel serverless function to initialize user with default habits
// Load environment variables at the top
import '../server/db/connection.js'; // This will initialize the connection
import pool from '../server/db/connection.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mobile_number } = req.body;
    
    if (!mobile_number) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Check if mobile_number column exists
    let hasMobileColumn = true;
    try {
      await pool.query('SELECT mobile_number FROM habits LIMIT 1');
    } catch (err) {
      if (err.code === '42703') {
        hasMobileColumn = false;
      } else {
        throw err;
      }
    }
    
    if (hasMobileColumn) {
      // Check if user already has habits (to avoid duplicates)
      const existingHabits = await pool.query(
        'SELECT COUNT(*) as count FROM habits WHERE mobile_number = $1',
        [mobile_number]
      );

      if (parseInt(existingHabits.rows[0].count) > 0) {
        // User already has habits, skip initialization
        return res.status(200).json({ 
          message: 'User already initialized',
          habitsCount: parseInt(existingHabits.rows[0].count)
        });
      }
    }

    // Default habits to copy
    const defaultHabits = [
      { name: 'Wake up at 05:00', emoji: '⏰', goal: 30, color: 'blue' },
      { name: 'Gym', emoji: '💪', goal: 20, color: 'red' },
      { name: 'Reading / Learning', emoji: '📚', goal: 30, color: 'purple' },
      { name: 'Budget Tracking', emoji: '💰', goal: 30, color: 'green' },
      { name: 'Project Work', emoji: '🎯', goal: 25, color: 'orange' },
      { name: 'No Alcohol', emoji: '🚫', goal: 30, color: 'yellow' },
      { name: 'Social Media Detox', emoji: '📵', goal: 30, color: 'pink' },
      { name: 'Goal Journaling', emoji: '📝', goal: 30, color: 'indigo' },
      { name: 'Cold Shower', emoji: '❄️', goal: 30, color: 'cyan' },
      { name: 'Meditation', emoji: '🧘', goal: 30, color: 'teal' }
    ];

    // Check if mobile_number column exists
    let hasMobileColumn = true;
    try {
      await pool.query('SELECT mobile_number FROM habits LIMIT 1');
    } catch (err) {
      if (err.code === '42703') {
        hasMobileColumn = false;
      } else {
        throw err;
      }
    }

    // Insert default habits for the user
    const insertedHabits = [];
    
    for (const habit of defaultHabits) {
      let result;
      if (hasMobileColumn) {
        result = await pool.query(
          'INSERT INTO habits (name, emoji, goal, color, mobile_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [habit.name, habit.emoji, habit.goal, habit.color, mobile_number]
        );
      } else {
        // Fallback if column doesn't exist yet
        result = await pool.query(
          'INSERT INTO habits (name, emoji, goal, color) VALUES ($1, $2, $3, $4) RETURNING *',
          [habit.name, habit.emoji, habit.goal, habit.color]
        );
      }
      insertedHabits.push(result.rows[0]);
    }

    return res.status(201).json({ 
      message: 'Default habits initialized',
      habitsCount: insertedHabits.length,
      habits: insertedHabits
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return res.status(500).json({ 
      error: 'Failed to initialize user',
      message: error.message,
      code: error.code
    });
  }
}


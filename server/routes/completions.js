import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Helper function to normalize date to YYYY-MM-DD format (local timezone)
// This ensures dates are always stored in local timezone, not UTC
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // If it's a Date object or ISO string, convert to local date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Get local date components (avoid UTC conversion)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Get all completions for a date range
router.get('/', async (req, res) => {
  try {
    let { startDate, endDate, habitId } = req.query;
    
    // Normalize dates to YYYY-MM-DD format
    if (startDate) {
      startDate = normalizeDate(startDate);
    }
    if (endDate) {
      endDate = normalizeDate(endDate);
    }
    
    const { mobile_number } = req.query;
    
    if (!mobile_number) {
      // If no mobile_number provided, return empty array (security: don't show all users' completions)
      return res.json([]);
    }
    
    let query = 'SELECT id, habit_id, date::text as date, completed, created_at, updated_at FROM completions WHERE mobile_number = $1';
    const params = [mobile_number];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    if (habitId) {
      // Convert habitId to integer
      const habitIdInt = parseInt(habitId, 10);
      if (!isNaN(habitIdInt)) {
        query += ` AND habit_id = $${paramCount}`;
        params.push(habitIdInt);
        paramCount++;
      }
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completions:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Handle timeout errors specifically
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Database connection timeout',
        message: 'The database request took too long. Please try again.',
        code: error.code
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch completions',
      message: error.message,
      code: error.code
    });
  }
});

// Get completion for a specific habit and date
router.get('/:habitId/:date', async (req, res) => {
  try {
    const { habitId, date } = req.params;
    const { mobile_number } = req.query;
    
    if (!mobile_number) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }
    
    // Normalize date to YYYY-MM-DD format
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Convert habitId to integer (database stores as integer)
    const habitIdInt = parseInt(habitId, 10);
    if (isNaN(habitIdInt)) {
      return res.status(400).json({ error: 'Invalid habit ID' });
    }
    
    const result = await pool.query(
      'SELECT id, habit_id, date::text as date, completed, created_at, updated_at FROM completions WHERE habit_id = $1 AND date = $2 AND mobile_number = $3',
      [habitIdInt, normalizedDate, mobile_number]
    );
    
    if (result.rows.length === 0) {
      return res.json({ completed: false });
    }
    
    // Return the completion status
    const completion = result.rows[0];
    res.json({ 
      completed: completion.completed === true || completion.completed === 'true' || completion.completed === 1 || completion.completed === 't' || completion.completed === 'T'
    });
  } catch (error) {
    console.error('Error fetching completion:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch completion',
      message: error.message,
      code: error.code
    });
  }
});

// Create or update a completion
router.post('/', async (req, res) => {
  try {
    const { habitId, date, completed, mobile_number } = req.body;
    
    if (!habitId || !date || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'habitId, date, and completed are required' });
    }
    
    if (!mobile_number) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }
    
    // Normalize date to YYYY-MM-DD format (local timezone)
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }
    
    // Convert habitId to integer (database stores as integer)
    const habitIdInt = parseInt(habitId, 10);
    if (isNaN(habitIdInt)) {
      return res.status(400).json({ error: 'Invalid habit ID' });
    }
    
    const result = await pool.query(
      `INSERT INTO completions (habit_id, date, completed, mobile_number) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (habit_id, mobile_number, date) 
       DO UPDATE SET completed = $3, updated_at = CURRENT_TIMESTAMP 
       RETURNING id, habit_id, date::text as date, completed, created_at, updated_at`,
      [habitIdInt, normalizedDate, completed, mobile_number]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving completion:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to save completion',
      message: error.message,
      code: error.code
    });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    let { startDate, endDate, mobile_number } = req.query;
    
    if (!mobile_number) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }
    
    // Normalize dates to YYYY-MM-DD format
    if (startDate) {
      startDate = normalizeDate(startDate);
    }
    if (endDate) {
      endDate = normalizeDate(endDate);
    }
    
    let query = `
      SELECT 
        COUNT(DISTINCT habit_id) as total_habits,
        COUNT(*) FILTER (WHERE completed = true) as total_completions,
        COUNT(*) as total_possible
      FROM completions
      WHERE mobile_number = $1
    `;
    
    const params = [mobile_number];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;


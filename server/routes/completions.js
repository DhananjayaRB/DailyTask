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
    
    let query = 'SELECT id, habit_id, date::text as date, completed, created_at, updated_at FROM completions WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
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
      query += ` AND habit_id = $${paramCount}`;
      params.push(habitId);
      paramCount++;
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completions:', error);
    res.status(500).json({ error: 'Failed to fetch completions' });
  }
});

// Get completion for a specific habit and date
router.get('/:habitId/:date', async (req, res) => {
  try {
    const { habitId, date } = req.params;
    
    // Normalize date to YYYY-MM-DD format
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const result = await pool.query(
      'SELECT id, habit_id, date::text as date, completed, created_at, updated_at FROM completions WHERE habit_id = $1 AND date = $2',
      [habitId, normalizedDate]
    );
    
    if (result.rows.length === 0) {
      return res.json({ completed: false });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching completion:', error);
    res.status(500).json({ error: 'Failed to fetch completion' });
  }
});

// Create or update a completion
router.post('/', async (req, res) => {
  try {
    const { habitId, date, completed } = req.body;
    
    if (!habitId || !date || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'habitId, date, and completed are required' });
    }
    
    // Normalize date to YYYY-MM-DD format (local timezone)
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }
    
    const result = await pool.query(
      `INSERT INTO completions (habit_id, date, completed) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (habit_id, date) 
       DO UPDATE SET completed = $3, updated_at = CURRENT_TIMESTAMP 
       RETURNING id, habit_id, date::text as date, completed, created_at, updated_at`,
      [habitId, normalizedDate, completed]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving completion:', error);
    res.status(500).json({ error: 'Failed to save completion' });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    
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
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
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


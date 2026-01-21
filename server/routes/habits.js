import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all habits
router.get('/', async (req, res) => {
  try {
    const { mobile_number } = req.query;
    
    // Check if mobile_number column exists
    let hasMobileColumn = true;
    try {
      await pool.query('SELECT mobile_number FROM habits LIMIT 1');
    } catch (err) {
      if (err.code === '42703') { // column does not exist
        hasMobileColumn = false;
      } else {
        throw err;
      }
    }
    
    let query = 'SELECT * FROM habits';
    const params = [];
    
    if (hasMobileColumn) {
      if (mobile_number) {
        query += ' WHERE mobile_number = $1';
        params.push(mobile_number);
      } else {
        // If no mobile_number provided, return empty array (security: don't show all users' habits)
        return res.json([]);
      }
    } else {
      // Column doesn't exist yet - return all habits (backward compatibility)
      // This allows the app to work before migration is run
      console.warn('⚠️ mobile_number column does not exist. Returning all habits. Please run migration.');
    }
    
    query += ' ORDER BY created_at ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching habits:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch habits',
      message: error.message,
      code: error.code
    });
  }
});

// Get a single habit
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM habits WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { name, emoji, goal, color, mobile_number } = req.body;
    
    if (!name || !emoji) {
      return res.status(400).json({ error: 'Name and emoji are required' });
    }
    
    // Check if mobile_number column exists
    let hasMobileColumn = true;
    try {
      await pool.query('SELECT mobile_number FROM habits LIMIT 1');
    } catch (err) {
      if (err.code === '42703') { // column does not exist
        hasMobileColumn = false;
        console.warn('⚠️ mobile_number column does not exist. Saving without mobile_number. Please run migration.');
      } else {
        throw err;
      }
    }
    
    let result;
    if (hasMobileColumn && mobile_number) {
      result = await pool.query(
        'INSERT INTO habits (name, emoji, goal, color, mobile_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, emoji, goal || 30, color || 'blue', mobile_number]
      );
    } else {
      // Fallback for backward compatibility
      result = await pool.query(
        'INSERT INTO habits (name, emoji, goal, color) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, emoji, goal || 30, color || 'blue']
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Update a habit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji, goal, color } = req.body;
    
    const result = await pool.query(
      'UPDATE habits SET name = $1, emoji = $2, goal = $3, color = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, emoji, goal, color, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM habits WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    res.json({ message: 'Habit deleted successfully', habit: result.rows[0] });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;


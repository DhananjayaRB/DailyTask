import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all habits
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits ORDER BY created_at ASC');
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
    const { name, emoji, goal, color } = req.body;
    
    if (!name || !emoji) {
      return res.status(400).json({ error: 'Name and emoji are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO habits (name, emoji, goal, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, emoji, goal || 30, color || 'blue']
    );
    
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


// Vercel serverless function for users API
// Load environment variables at the top
import '../server/db/connection.js'; // This will initialize the connection
import pool from '../server/db/connection.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if mobile number exists
  if (req.method === 'GET' && req.query.mobile && !req.query.getUser) {
    try {
      const { mobile } = req.query;
      
      // First check users table
      let hasUsersTable = true;
      let userExists = false;
      
      try {
        const userResult = await pool.query(
          'SELECT mobile_number FROM users WHERE mobile_number = $1 LIMIT 1',
          [mobile]
        );
        userExists = userResult.rows.length > 0;
      } catch (err) {
        if (err.code === '42P01') { // table does not exist
          hasUsersTable = false;
        } else {
          throw err;
        }
      }
      
      // If users table doesn't exist, check habits table
      if (!hasUsersTable || !userExists) {
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
          const result = await pool.query(
            'SELECT DISTINCT mobile_number FROM habits WHERE mobile_number = $1 LIMIT 1',
            [mobile]
          );
          userExists = result.rows.length > 0;
        }
      }
      
      return res.status(200).json({ 
        exists: userExists 
      });
    } catch (error) {
      console.error('Error checking mobile:', error);
      return res.status(500).json({ 
        error: 'Failed to check mobile number',
        message: error.message 
      });
    }
  }
  
  // Get user info by mobile (for login)
  if (req.method === 'GET' && req.query.getUser && req.query.mobile) {
    try {
      const { mobile } = req.query;
      
      // Try to get from users table first
      let hasUsersTable = true;
      try {
        const userResult = await pool.query(
          'SELECT name, mobile_number, unique_number FROM users WHERE mobile_number = $1 LIMIT 1',
          [mobile]
        );
        
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          return res.status(200).json({ 
            exists: true,
            name: user.name,
            mobile: user.mobile_number,
            uniqueNumber: user.unique_number
          });
        }
      } catch (err) {
        if (err.code === '42P01') { // table does not exist
          hasUsersTable = false;
        } else {
          throw err;
        }
      }
      
      // Fallback: check habits table
      if (!hasUsersTable) {
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
          const result = await pool.query(
            'SELECT mobile_number FROM habits WHERE mobile_number = $1 LIMIT 1',
            [mobile]
          );
          
          if (result.rows.length > 0) {
            // User exists but no users table - return basic info
            return res.status(200).json({ 
              exists: true,
              name: `User ${mobile}`,
              mobile: mobile,
              uniqueNumber: mobile.substring(0, 4)
            });
          }
        }
      }
      
      return res.status(200).json({ 
        exists: false 
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return res.status(500).json({ 
        error: 'Failed to get user',
        message: error.message 
      });
    }
  }
  
  // Create/Register user
  if (req.method === 'POST') {
    try {
      const { name, mobile_number, unique_number } = req.body;
      
      if (!name || !mobile_number || !unique_number) {
        return res.status(400).json({ error: 'Name, mobile_number, and unique_number are required' });
      }
      
      // Check if users table exists
      let hasUsersTable = true;
      try {
        await pool.query('SELECT 1 FROM users LIMIT 1');
      } catch (err) {
        if (err.code === '42P01') {
          hasUsersTable = false;
        } else {
          throw err;
        }
      }
      
      if (hasUsersTable) {
        // Insert into users table
        const result = await pool.query(
          'INSERT INTO users (name, mobile_number, unique_number) VALUES ($1, $2, $3) ON CONFLICT (mobile_number) DO UPDATE SET name = $1, unique_number = $3, updated_at = CURRENT_TIMESTAMP RETURNING *',
          [name, mobile_number, unique_number]
        );
        
        return res.status(201).json({ 
          success: true,
          user: result.rows[0]
        });
      } else {
        // Users table doesn't exist - just return success
        // User will be created when they create their first habit
        return res.status(201).json({ 
          success: true,
          message: 'User registration initiated'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ 
        error: 'Failed to create user',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

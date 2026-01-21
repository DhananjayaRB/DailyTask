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
  if (req.method === 'GET' && req.query.mobile) {
    try {
      const { mobile } = req.query;
      
      // Check if mobile exists in habits table (any habit with this mobile)
      const result = await pool.query(
        'SELECT DISTINCT mobile_number FROM habits WHERE mobile_number = $1 LIMIT 1',
        [mobile]
      );
      
      return res.status(200).json({ 
        exists: result.rows.length > 0 
      });
    } catch (error) {
      console.error('Error checking mobile:', error);
      return res.status(500).json({ 
        error: 'Failed to check mobile number',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


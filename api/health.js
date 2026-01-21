// Vercel serverless function for health check
import pool from '../server/db/connection.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDbUser: !!process.env.DB_USER,
        hasDbHost: !!process.env.DB_HOST,
        hasDbName: !!process.env.DB_NAME,
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: error.message,
      code: error.code,
      hint: 'Check environment variables and database connection'
    });
  }
}


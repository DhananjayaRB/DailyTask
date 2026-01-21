// Vercel serverless function for habits API
// Load environment variables at the top
import '../server/db/connection.js'; // This will initialize the connection
import habitsRouter from '../server/routes/habits.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Mount router - Express automatically strips the mount path
// So /api/habits becomes / for the router, /api/habits/123 becomes /123
app.use('/api/habits', habitsRouter);

// Vercel serverless function handler
export default async (req, res) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Function error', 
      message: error.message 
    });
  }
};


// Vercel serverless function for habits API
import habitsRouter from '../server/routes/habits.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount router - Express automatically strips the mount path
// So /api/habits becomes / for the router, /api/habits/123 becomes /123
app.use('/api/habits', habitsRouter);

// Vercel serverless function handler
export default async (req, res) => {
  return app(req, res);
};


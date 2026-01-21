// Vercel serverless function for habits API
import habitsRouter from '../../server/routes/habits.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount router at root since Vercel routes /api/habits/* to this function
app.use('/', habitsRouter);

// Export as Vercel serverless function
export default app;


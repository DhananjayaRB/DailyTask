// Vercel serverless function for completions API
import completionsRouter from '../server/routes/completions.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount router - Express automatically strips the mount path
// So /api/completions becomes / for the router, /api/completions/123 becomes /123
app.use('/api/completions', completionsRouter);

// Vercel serverless function handler
export default async (req, res) => {
  return app(req, res);
};


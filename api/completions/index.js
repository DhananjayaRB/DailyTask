// Vercel serverless function for completions API
import completionsRouter from '../../server/routes/completions.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount router at root since Vercel routes /api/completions/* to this function
app.use('/', completionsRouter);

// Vercel serverless function handler
export default function handler(req, res) {
  return app(req, res);
}


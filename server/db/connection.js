import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Support both DATABASE_URL (Vercel Postgres) and individual connection parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (Vercel Postgres format)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
      rejectUnauthorized: false
    }
  };
} else {
  // Use individual connection parameters
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '20.204.119.48',
    database: process.env.DB_NAME || 'demo_task',
    password: process.env.DB_PASSWORD || 'resolve@2022',
    port: parseInt(process.env.DB_PORT || '5432'),
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;


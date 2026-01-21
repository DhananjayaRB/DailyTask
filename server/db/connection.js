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
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : {
      rejectUnauthorized: false
    },
    // Connection pool settings for serverless
    max: 1, // Limit connections in serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  // Use individual connection parameters
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // Connection pool settings for serverless
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

// Validate configuration
if (!poolConfig.connectionString && (!poolConfig.user || !poolConfig.host || !poolConfig.database)) {
  console.error('❌ Database configuration missing!');
  console.error('Required: DATABASE_URL or (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD)');
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit in serverless environment - just log the error
  if (process.env.VERCEL) {
    console.error('Database connection error in Vercel:', err.message);
  } else {
    process.exit(-1);
  }
});

export default pool;


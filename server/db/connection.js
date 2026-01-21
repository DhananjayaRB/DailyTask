import pkg from 'pg';
import dotenv from 'dotenv';

// Only load .env in development (not needed in Vercel where env vars are set directly)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  dotenv.config();
}

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
    // SSL disabled - database server doesn't support SSL
    // Set DB_SSL=true in environment variables if SSL is needed
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    // Connection pool settings for serverless
    max: 1, // Limit connections in serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000, // Increased for remote databases
    // Additional settings for remote database connections
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };
}

// Validate configuration
if (!poolConfig.connectionString && (!poolConfig.user || !poolConfig.host || !poolConfig.database)) {
  const errorMsg = '❌ Database configuration missing! Required: DATABASE_URL or (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD)';
  console.error(errorMsg);
  console.error('Current env vars:', {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDbUser: !!process.env.DB_USER,
    hasDbHost: !!process.env.DB_HOST,
    hasDbName: !!process.env.DB_NAME,
    hasDbPassword: !!process.env.DB_PASSWORD ? '***' : false,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
  });
  throw new Error(errorMsg);
}

// Log configuration (without sensitive data)
console.log('Database config:', {
  hasConnectionString: !!poolConfig.connectionString,
  host: poolConfig.host || (poolConfig.connectionString ? 'from connection string' : 'not set'),
  database: poolConfig.database || (poolConfig.connectionString ? 'from connection string' : 'not set'),
  port: poolConfig.port,
  max: poolConfig.max,
  ssl: poolConfig.ssl ? 'enabled' : 'disabled',
});

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


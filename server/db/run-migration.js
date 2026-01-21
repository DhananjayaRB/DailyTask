// Run this script to add mobile_number columns to existing database
import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  dotenv.config();
}

const { Pool } = pkg;

// Support both DATABASE_URL and individual connection parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : {
      rejectUnauthorized: false
    },
  };
} else {
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  };
}

const pool = new Pool(poolConfig);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    
    // Check if columns already exist
    const checkHabits = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'habits' AND column_name = 'mobile_number'
    `);
    
    const checkCompletions = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'completions' AND column_name = 'mobile_number'
    `);
    
    if (checkHabits.rows.length > 0 && checkCompletions.rows.length > 0) {
      console.log('✅ Migration already completed. Columns exist.');
      return;
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    console.log('📝 Adding mobile_number to habits table...');
    await client.query(`
      ALTER TABLE habits 
      ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20)
    `);
    
    console.log('📝 Adding mobile_number to completions table...');
    await client.query(`
      ALTER TABLE completions 
      ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20)
    `);
    
    console.log('📝 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_habits_mobile ON habits(mobile_number)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_completions_mobile ON completions(mobile_number)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_completions_mobile_date ON completions(mobile_number, date)
    `);
    
    console.log('📝 Updating unique constraint...');
    // Drop old constraint if it exists
    try {
      await client.query(`
        ALTER TABLE completions 
        DROP CONSTRAINT IF EXISTS completions_habit_id_date_key
      `);
    } catch (err) {
      // Constraint might not exist, that's okay
      console.log('   (Old constraint not found, skipping)');
    }
    
    // Add new constraint
    try {
      await client.query(`
        ALTER TABLE completions 
        ADD CONSTRAINT completions_habit_mobile_date_unique 
        UNIQUE(habit_id, mobile_number, date)
      `);
    } catch (err) {
      if (err.code === '42P16') {
        // Constraint already exists
        console.log('   (Constraint already exists)');
      } else {
        throw err;
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ mobile_number columns added to habits and completions tables');
    console.log('✅ Indexes created for better performance');
    console.log('✅ Unique constraint updated');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();


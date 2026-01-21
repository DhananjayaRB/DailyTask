import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dail_task',
  password: process.env.DB_PASSWORD || 'Resolve@321',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function setupDatabase() {
  try {
    console.log('📊 Setting up database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully!');
    
    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check habits count
    const habitsResult = await pool.query('SELECT COUNT(*) as count FROM habits');
    console.log(`\n📝 Default habits inserted: ${habitsResult.rows[0].count}`);
    
    // Show habits
    const habits = await pool.query('SELECT id, name, emoji FROM habits ORDER BY id');
    console.log('\n🎯 Default habits:');
    habits.rows.forEach(habit => {
      console.log(`   ${habit.emoji} ${habit.name}`);
    });
    
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();


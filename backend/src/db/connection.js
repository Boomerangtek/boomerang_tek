import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Enable SSL in production, or whenever the connection string asks for it
// (managed Postgres like Neon requires SSL even in local development).
const dbUrl = process.env.DATABASE_URL || '';
const requiresSsl =
  process.env.NODE_ENV === 'production' ||
  dbUrl.includes('sslmode=require') ||
  dbUrl.includes('neon.tech');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;

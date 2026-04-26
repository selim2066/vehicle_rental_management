import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// const pool = new Pool({
//   host:     process.env.DB_HOST,
//   port:     Number(process.env.DB_PORT) || 5432,
//   database: process.env.DB_NAME,
//   user:     process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   ssl: { rejectUnauthorized: false },
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database from database.ts');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;

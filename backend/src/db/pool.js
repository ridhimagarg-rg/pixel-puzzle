import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('[db] Missing DATABASE_URL environment variable. Set it in backend/.env (local) or in Render dashboard (production).');
}

// Neon (and most managed Postgres providers) require SSL. Standard local Postgres does not.
// We detect this by checking whether the connection string points at localhost.
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err);
});

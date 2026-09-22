// Run with: npm run migrate
// Creates the scores table if it doesn't already exist. Safe to run multiple times.
import { pool } from './pool.js';

const SQL = `
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  name VARCHAR(20) NOT NULL,
  moves INTEGER NOT NULL,
  elapsed INTEGER NOT NULL,
  checks INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scores_level_rank
  ON scores (level, moves ASC, elapsed ASC);
`;

async function run() {
  try {
    await pool.query(SQL);
    console.log('[migrate] scores table ready.');
  } catch (err) {
    console.error('[migrate] failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();

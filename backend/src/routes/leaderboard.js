import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// GET /api/leaderboard/:level -> top 10 runs for a level, ranked by fewest moves then fastest time
router.get('/:level', async (req, res) => {
  const level = Number(req.params.level);
  if (![1, 2, 3].includes(level)) {
    return res.status(400).json({ error: 'level must be 1, 2, or 3' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT name, moves, elapsed, checks, score, created_at
       FROM scores
       WHERE level = $1
       ORDER BY moves ASC, elapsed ASC
       LIMIT 10`,
      [level]
    );
    res.json(rows);
  } catch (err) {
    console.error('[leaderboard:get]', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// POST /api/leaderboard -> save a run: { level, name, moves, elapsed, checks, score }
router.post('/', async (req, res) => {
  const { level, name, moves, elapsed, checks, score } = req.body || {};

  if (![1, 2, 3].includes(Number(level))) {
    return res.status(400).json({ error: 'level must be 1, 2, or 3' });
  }
  const cleanName = String(name || 'ANON_USER').trim().slice(0, 20) || 'ANON_USER';
  const nums = { moves, elapsed, checks, score };
  for (const [k, v] of Object.entries(nums)) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
      return res.status(400).json({ error: `${k} must be a non-negative number` });
    }
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO scores (level, name, moves, elapsed, checks, score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, moves, elapsed, checks, score, created_at`,
      [level, cleanName, moves, elapsed, checks, score]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[leaderboard:post]', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

export default router;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import leaderboardRouter from './routes/leaderboard.js';

const app = express();

// CORS: comma-separated list of allowed origins from env, so the same code
// works for local dev (http://localhost:5173) and your deployed Vercel URL.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow requests with no origin (curl, server-to-server, health checks)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pixel-puzzle-backend', time: new Date().toISOString() });
});

app.use('/api/leaderboard', leaderboardRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Render (and most hosts) provide PORT via env var. Never hardcode it.
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[server] pixel-puzzle backend listening on port ${PORT}`);
});

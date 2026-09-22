# Pixel Puzzle — Block by Block

Full-stack rebuild of the prototype using: React 18 + Vite, Tailwind CSS v3, React Router v6,
Zustand, @dnd-kit/core, Node.js + Express, PostgreSQL (Neon), deployed to Vercel (frontend) and
Render (backend).

## File structure

```
pixel-puzzle/
├── frontend/                  React 18 + Vite app
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json            SPA routing rewrite for Vercel
│   ├── .env.example           VITE_API_URL
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            Routes
│       ├── index.css          Tailwind + CRT effects
│       ├── data/levels.js     3 levels of scrambled blocks + target HTML
│       ├── store/useGameStore.js   Zustand store (progress persisted to localStorage)
│       ├── api/client.js      Fetch wrapper, base URL from env var
│       ├── components/        NavBar, SourceBlock, PlacedBlock, DropZone, Modals
│       └── pages/              Home, Game, Result, Leaderboard
└── backend/                    Node.js + Express API
    ├── render.yaml
    ├── .env.example             DATABASE_URL, PORT, CORS_ORIGIN
    └── src/
        ├── server.js
        ├── db/pool.js           pg Pool, SSL auto-detected
        ├── db/migrate.js        creates the `scores` table
        └── routes/leaderboard.js
```

## Why nothing is hardcoded

- **Frontend → backend URL**: read from `VITE_API_URL` (`frontend/.env` locally,
  a Vercel project environment variable in production). `src/api/client.js` builds every
  request as `${VITE_API_URL}/api/...`.
- **Backend port**: read from `process.env.PORT` (Render injects this automatically; `.env`
  sets a local fallback of 4000).
- **Backend → database**: read from `process.env.DATABASE_URL` (your Neon connection string).
- **CORS**: read from `process.env.CORS_ORIGIN`, a comma-separated list, so you can allow both
  `http://localhost:5173` and your live Vercel domain at once.

Nothing in the code assumes `localhost` — the same build artifacts run locally or in production;
only the environment variables change.

## Run locally

**1. Database** — create a free Neon project (or use local Postgres), then:

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL to point at your database
npm install
npm run migrate             # creates the `scores` table
npm run dev                 # http://localhost:4000
```

**2. Frontend** — in a second terminal:

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173 — the app is fully playable, and saved scores go to your Postgres
database instead of localStorage.

## Deploy

**Backend → Render**

1. Push this repo to GitHub.
2. New Web Service on Render, root directory `backend` (or use the included `render.yaml`
   blueprint).
3. Build command `npm install`, start command `npm start`.
4. Set environment variables in the Render dashboard: `DATABASE_URL` (your Neon string) and
   `CORS_ORIGIN` (add your Vercel URL once you have it, comma-separated with localhost if you
   want to keep testing locally against the deployed API).
5. After first deploy, run the migration once: open a Render Shell for the service and run
   `npm run migrate` (or run it locally with `DATABASE_URL` pointed at the same Neon database).

**Frontend → Vercel**

1. Import the repo into Vercel, set the root directory to `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
3. Set the environment variable `VITE_API_URL` to your Render backend URL
   (e.g. `https://pixel-puzzle-backend.onrender.com`).
4. Deploy. `vercel.json` already rewrites all paths to `index.html` so React Router's client-side
   routes (`/game/:level`, `/result`, `/leaderboard`) work on refresh.

Once both are deployed, update the backend's `CORS_ORIGIN` to include the real Vercel URL and
redeploy the backend (or just add the env var and let Render restart it).

## Game notes

- Level unlock/completion state persists in the browser via Zustand's `persist` middleware
  (localStorage key `pixel-puzzle-progress`) — this is per-device progress, not accounts.
- Leaderboard scores are the multiplayer/global part and are stored in Postgres via the
  `/api/leaderboard` endpoints, so everyone who plays your deployed site shares the same board.
- Drag-and-drop is implemented with `@dnd-kit/core` + `@dnd-kit/sortable`: drag a block from
  "SCRAMBLED_BLOCKS" into "YOUR_CODE" (or click it), drag within "YOUR_CODE" to reorder, and
  double-click a placed block to send it back to the pool.

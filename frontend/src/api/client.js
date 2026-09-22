// Base URL is read from an environment variable so the exact same build works
// locally and in production. Vite exposes anything prefixed VITE_ on
// import.meta.env at build time.
//
// Local dev:   VITE_API_URL=http://localhost:4000        (frontend/.env)
// Production:  VITE_API_URL=https://your-backend.onrender.com  (Vercel project env var)
//
// If the variable isn't set at all, we fall back to same-origin ('') so a
// request to `${API_URL}/api/...` becomes a relative `/api/...` call —
// useful if you ever reverse-proxy the API behind the same domain.
const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* response wasn't JSON, ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getLeaderboard: (level) => request(`/api/leaderboard/${level}`),
  saveScore: (entry) =>
    request('/api/leaderboard', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
  health: () => request('/api/health'),
};

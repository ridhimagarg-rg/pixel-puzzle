import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { fmtTime } from '../data/levels.js';

const RANK_EMOJI = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [level, setLevel] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getLeaderboard(level)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Could not load leaderboard. Is the backend running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [level]);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">
      <div className="font-mono text-[26px] text-green text-glow-green mb-1.5">
        &gt; LEADERBOARD
      </div>
      <div className="text-[14px] text-ink2 mb-7">
        Top runs ranked by fewest moves, then fastest time.
      </div>
      <div className="flex gap-2 mb-5">
        {[1, 2, 3].map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`font-mono text-[11px] border rounded-sm px-3 py-1.5 tracking-[0.08em] transition-all ${
              level === lv
                ? 'border-green text-green bg-green-dim shadow-[0_0_8px_var(--tw-shadow-color)] shadow-green-dim'
                : 'border-border text-muted'
            }`}
          >
            Level {lv}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 font-mono text-[12px] text-muted2">Loading…</div>
      )}

      {!loading && error && (
        <div className="text-center py-10 font-mono text-[12px] text-danger">&gt; {error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-10 font-mono text-[12px] text-muted2">
          &gt;_ No runs recorded yet for Level {level}.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['RANK', 'CALLSIGN', 'SCORE', 'MOVES', 'TIME', 'CHECKS'].map((h) => (
                <th
                  key={h}
                  className="font-mono text-[10px] text-muted tracking-[0.12em] text-left px-3.5 py-2.5 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.name}-${r.created_at}-${i}`} className="hover:bg-bg3">
                <td className="px-3.5 py-3 border-b border-[#111820] font-mono text-[13px] text-muted">
                  {RANK_EMOJI[i] || `#${i + 1}`}
                </td>
                <td className="px-3.5 py-3 border-b border-[#111820] font-mono text-[13px] font-semibold text-ink">
                  {r.name}
                </td>
                <td className="px-3.5 py-3 border-b border-[#111820] font-mono text-[13px] text-green">
                  {r.score} pts
                </td>
                <td className="px-3.5 py-3 border-b border-[#111820] font-mono text-[12px] text-cyan">
                  {r.moves} moves
                </td>
                <td className="px-3.5 py-3 border-b border-[#111820] font-mono text-[12px] text-ink2">
                  {fmtTime(r.elapsed)}
                </td>
                <td className="px-3.5 py-3 border-b border-[#111820] font-mono text-[12px] text-ink2">
                  {r.checks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

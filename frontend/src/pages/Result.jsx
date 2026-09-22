import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore.js';
import { LEVELS, fmtTime } from '../data/levels.js';
import { api } from '../api/client.js';

export default function Result() {
  const navigate = useNavigate();
  const { lastResult } = useGameStore();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!lastResult) {
    return (
      <div className="max-w-[560px] mx-auto px-6 py-16 text-center">
        <p className="text-ink2 mb-4">No recent run to show.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-transparent border border-green text-green font-mono text-[12px] px-6 py-2 rounded-sm"
        >
          [ HOME ]
        </button>
      </div>
    );
  }

  const { level, moves, elapsed, checks } = lastResult;
  const roundTitle = LEVELS[level]?.round.title ?? '';
  const score = moves * 10 + elapsed;

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);
    setError(null);
    try {
      await api.saveScore({
        level,
        name: (name.trim() || 'ANON_USER').toUpperCase().slice(0, 20),
        moves,
        elapsed,
        checks,
        score,
      });
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Could not save score. Is the backend running?');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[560px] mx-auto px-6 py-16 text-center">
      <div className="text-[52px] mb-4">🖥️</div>
      <div className="font-mono text-[28px] text-green text-glow-green mb-2">
        &gt; LEVEL_COMPLETE
      </div>
      <div className="text-[15px] text-ink2 mb-8">Level {level} — {roundTitle}</div>

      <div className="font-mono text-[11px] text-muted tracking-[0.12em]">FINAL SCORE</div>
      <div className="font-mono text-[42px] text-green text-glow-green my-4">{score} pts</div>

      <div className="grid grid-cols-2 gap-3 mb-7 text-left">
        <ResultCell label="TOTAL MOVES" value={moves} dim />
        <ResultCell label="TOTAL TIME" value={fmtTime(elapsed)} dim />
        <ResultCell label="CHECKS USED" value={checks} dim />
        <ResultCell label="ACCURACY" value="100%" />
      </div>

      <div className="mb-7 text-left">
        <label className="font-mono text-[11px] text-muted tracking-[0.1em] mb-2 block">
          &gt; ENTER_CALLSIGN (save to leaderboard)
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          spellCheck={false}
          placeholder="ANON_USER"
          className="bg-bg3 border border-border rounded-sm text-green font-mono text-[14px] px-3.5 py-2.5 w-full max-w-[340px] outline-none tracking-[0.06em] focus:border-green focus:shadow-[0_0_10px_var(--tw-shadow-color)] focus:shadow-green-dim placeholder:text-muted2"
        />
      </div>

      <div className="flex gap-2.5 justify-center flex-wrap mt-4">
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className="bg-transparent border border-green text-green font-mono text-[12px] px-6 py-2 rounded-sm tracking-[0.1em] shadow-[0_0_10px_var(--tw-shadow-color)] shadow-green-dim disabled:opacity-50"
        >
          {saving ? '[ SAVING... ]' : '[ SAVE SCORE ]'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-transparent border border-[#2a3a2c] text-ink2 font-mono text-[12px] px-6 py-2.5 rounded-sm tracking-[0.08em]"
        >
          [ HOME ]
        </button>
      </div>

      {saved && (
        <div className="mt-3.5 font-mono text-[12px] text-green">
          &gt; Score saved to leaderboard.
        </div>
      )}
      {error && <div className="mt-3.5 font-mono text-[12px] text-danger">&gt; {error}</div>}
    </div>
  );
}

function ResultCell({ label, value, dim }) {
  return (
    <div className="bg-panel border border-border rounded p-3.5">
      <div className="font-mono text-[10px] text-muted tracking-[0.1em] mb-1">{label}</div>
      <div className={`font-mono text-[22px] ${dim ? 'text-cyan' : 'text-green'}`}>{value}</div>
    </div>
  );
}

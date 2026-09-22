import { fmtTime } from '../data/levels.js';

export function RoundCompleteModal({ show, level, stats, onNext }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-5">
      <div className="relative bg-panel border border-green rounded-lg p-9 w-full max-w-[480px] text-center shadow-[0_0_40px_var(--tw-shadow-color)] shadow-green-dim">
        <div className="text-[46px] mb-4">✅</div>
        <div className="text-[26px] font-bold text-green text-glow-green font-mono mb-1.5">
          LEVEL_{String(level).padStart(2, '0')} COMPLETE
        </div>
        <div className="text-[14px] text-ink2 mb-6">Reconstruction verified.</div>
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
          <StatCell label="MOVES THIS ROUND" value={stats.moves} />
          <StatCell label="CHECKS USED" value={stats.checks} amber />
          <StatCell label="TIME" value={fmtTime(stats.elapsed)} />
          <StatCell label="ACCURACY" value="100%" />
        </div>
        <button
          onClick={onNext}
          className="w-full bg-green text-black font-mono text-[13px] py-3.5 rounded tracking-[0.12em] font-bold transition-shadow hover:shadow-[0_0_20px_#00ff41]"
        >
          VIEW RESULTS →
        </button>
      </div>
    </div>
  );
}

export function TimeoutModal({ show, onRetry, onHome }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[300]">
      <div className="bg-panel border border-danger rounded-lg p-10 text-center shadow-[0_0_40px_#ff3c3c30] w-full max-w-[420px]">
        <div className="text-[48px] mb-4">⏰</div>
        <div className="font-mono text-[22px] text-danger text-glow-red mb-2.5">TIME_EXPIRED</div>
        <div className="text-[14px] text-ink2 mb-6">
          You ran out of time. The connection was lost.
          <br />
          Try this level again.
        </div>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={onRetry}
            className="bg-transparent border border-danger text-danger font-mono text-[12px] px-6 py-2.5 rounded-sm tracking-[0.1em] hover:bg-[#ff3c3c15]"
          >
            [ RETRY ]
          </button>
          <button
            onClick={onHome}
            className="bg-transparent border border-[#2a3a2c] text-ink2 font-mono text-[12px] px-6 py-2.5 rounded-sm tracking-[0.08em] hover:border-muted hover:text-ink"
          >
            [ HOME ]
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, amber }) {
  return (
    <div className="bg-bg3 border border-border rounded p-3">
      <div className="font-mono text-[10px] text-muted tracking-[0.1em] mb-1">{label}</div>
      <div className={`font-mono text-[18px] ${amber ? 'text-amber' : 'text-green'}`}>{value}</div>
    </div>
  );
}

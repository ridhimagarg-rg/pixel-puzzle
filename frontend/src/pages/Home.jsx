import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore.js';

const CARDS = [
  {
    lv: 1,
    tag: 'LEVEL_01',
    accent: 'before:bg-green',
    title: 'Bootstrap',
    desc: 'Pure HTML structure. Tags, nesting, page skeleton. No styling — just bones.',
    meta: '10 min limit · HTML only',
  },
  {
    lv: 2,
    tag: 'LEVEL_02',
    accent: 'before:bg-amber',
    title: 'Stylesheet',
    desc: 'HTML meets CSS. Components gain layout, spacing, color. Structure + style.',
    meta: '15 min limit · HTML + CSS',
  },
  {
    lv: 3,
    tag: 'LEVEL_03',
    accent: 'before:bg-danger',
    title: 'Full Stack',
    desc: 'Complex HTML + CSS. Multi-section layout, nested components, real challenge.',
    meta: '20 min limit · HTML + CSS (hard)',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isUnlocked, isCompleted, startLevel } = useGameStore();

  const handleStart = (lv) => {
    if (!isUnlocked(lv)) return;
    startLevel(lv);
    navigate(`/game/${lv}`);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="font-mono text-[clamp(48px,8vw,90px)] text-green text-glow-green-lg leading-none animate-flicker">
        &lt;/&gt;
      </div>
      <div className="font-mono text-[12px] text-muted mt-3 tracking-[0.08em]">
        &gt; SYSTEM READY — REBUILD PROTOCOL INITIATED
      </div>
      <h1 className="text-[clamp(32px,6vw,60px)] font-bold text-ink mt-7 mb-3.5 leading-[1.1] -tracking-[0.01em]">
        Reconstruct the
        <br />
        <em className="not-italic text-green">broken web.</em>
      </h1>
      <p className="text-ink2 text-base max-w-[540px] leading-relaxed mb-9">
        The old internet is gone. Using only scrambled HTML and CSS blocks, rebuild it from
        scratch — one line at a time. Logic, pattern recognition, speed.
      </p>
      <button
        onClick={() =>
          document.getElementById('level-section')?.scrollIntoView({ behavior: 'smooth' })
        }
        className="bg-transparent border border-green text-green font-mono text-[14px] px-8 py-3.5 tracking-[0.12em] rounded-sm shadow-[0_0_12px_var(--tw-shadow-color)] shadow-green-dim transition-all hover:bg-green-dim hover:shadow-green-glow"
      >
        ACCESS TERMINAL →
      </button>

      <div
        id="level-section"
        className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-[52px] max-w-[780px] w-full"
      >
        {CARDS.map((c) => {
          const unlocked = isUnlocked(c.lv);
          const done = isCompleted(c.lv);
          return (
            <div
              key={c.lv}
              onClick={() => handleStart(c.lv)}
              className={`relative overflow-hidden text-left bg-panel border border-border rounded-md p-5 transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] ${c.accent} ${
                unlocked
                  ? 'cursor-pointer hover:border-green hover:shadow-[0_0_20px_#00ff4110]'
                  : 'opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="font-mono text-[10px] tracking-[0.15em] mb-2.5 text-ink2">
                // {c.tag}
              </div>
              <h3 className="text-[18px] font-bold mb-1.5">{c.title}</h3>
              <p className="text-[13px] text-ink2 leading-relaxed font-normal">{c.desc}</p>
              <div className="mt-3.5 font-mono text-[10px] text-muted">{c.meta}</div>
              {!unlocked && (
                <div className="absolute top-4 right-4 text-lg">🔒</div>
              )}
              {unlocked && done && (
                <div className="absolute top-3 right-3 font-mono text-[10px] text-green bg-green-dim border border-green px-2 py-0.5 rounded-sm">
                  ✓ DONE
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

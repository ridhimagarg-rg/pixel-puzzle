import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useGameStore } from '../store/useGameStore.js';
import { LEVELS, fmtTime } from '../data/levels.js';
import SourceBlock from '../components/SourceBlock.jsx';
import DropZone from '../components/DropZone.jsx';
import { RoundCompleteModal, TimeoutModal } from '../components/Modals.jsx';

export default function Game() {
  const { level: levelParam } = useParams();
  const level = Number(levelParam);
  const navigate = useNavigate();

  const {
    currentLevel,
    currentTab,
    sourceBlocks,
    placedBlocks,
    moves,
    checks,
    elapsed,
    accuracy,
    startLevel,
    switchTab,
    addBlock,
    removeBlock,
    reorderPlaced,
    resetRound,
    tick,
    incrementChecks,
    isUnlocked,
    unlockLevel,
    markCompleted,
    setAccuracy,
    setLastResult,
  } = useGameStore();

  const roundData = LEVELS[level];
  const [feedback, setFeedback] = useState(null); // { msg, kind }
  const [showComplete, setShowComplete] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const intervalRef = useRef(null);

  // (Re)start the level whenever the URL level changes, or on first mount.
  useEffect(() => {
    if (!roundData) return;
    if (!isUnlocked(level)) {
      navigate('/');
      return;
    }
    if (currentLevel !== level) {
      startLevel(level);
    }
    setFeedback(null);
    setShowComplete(false);
    setShowTimeout(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Timer
  useEffect(() => {
    if (!roundData || showComplete || showTimeout) return;
    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundData, showComplete, showTimeout, currentLevel]);

  const timeLimit = roundData?.timeLimit ?? 0;
  const remaining = Math.max(0, timeLimit - elapsed);

  useEffect(() => {
    if (remaining <= 0 && !showComplete && roundData) {
      clearInterval(intervalRef.current);
      setShowTimeout(true);
    }
  }, [remaining, showComplete, roundData]);

  if (!roundData) {
    return <div className="p-10 text-center text-ink2">Unknown level.</div>;
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overIdRaw = over.id;

    if (activeData?.from === 'source') {
      // Dropping a fresh block from the pool into the dropzone.
      if (overIdRaw === 'dropzone' || String(overIdRaw).startsWith('placed-')) {
        addBlock(activeData.block);
      }
      return;
    }

    if (activeData?.from === 'placed') {
      // Reordering within the dropzone.
      if (String(overIdRaw).startsWith('placed-')) {
        const fromIndex = placedBlocks.findIndex((b) => `placed-${b.id}` === active.id);
        const toIndex = placedBlocks.findIndex((b) => `placed-${b.id}` === overIdRaw);
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          const next = arrayMove(placedBlocks, fromIndex, toIndex);
          reorderPlaced(fromIndex, toIndex);
          void next; // reorderPlaced already applies the move to the store
        }
      }
    }
  }

  function handleCheck() {
    if (!placedBlocks.length) {
      setFeedback({ msg: 'Place blocks in the code area first.', kind: 'wrong' });
      return;
    }
    incrementChecks();

    let allTargetIds = [];
    roundData.round.tabs.forEach((t) => {
      allTargetIds = allTargetIds.concat(roundData.round.blocks[t].map((b) => b.id));
    });
    const allPlacedIds = placedBlocks.map((b) => b.id);

    if (allPlacedIds.length !== allTargetIds.length) {
      const missing = allTargetIds.length - allPlacedIds.length;
      const acc = computeAccuracy(allPlacedIds, allTargetIds);
      setAccuracy(acc);
      setFeedback({
        msg: `Accuracy: ${acc}% — ${missing} block(s) missing. Rearrange and add all blocks. No blocks revealed.`,
        kind: 'bad',
      });
      return;
    }

    const correct = allPlacedIds.every((id, i) => id === allTargetIds[i]);
    if (correct) {
      setFeedback({ msg: '100% CORRECT — Reconstruction verified!', kind: 'good' });
      clearInterval(intervalRef.current);
      markCompleted(level);
      unlockLevel(level + 1);
      setTimeout(() => setShowComplete(true), 400);
    } else {
      const acc = computeAccuracy(allPlacedIds, allTargetIds);
      setAccuracy(acc);
      setFeedback({
        msg: `Accuracy: ${acc}% — Some blocks are out of order. No solution revealed. Keep rearranging.`,
        kind: 'bad',
      });
    }
  }

  function computeAccuracy(placedIds, targetIds) {
    let correct = 0;
    placedIds.forEach((id, i) => {
      if (targetIds[i] === id) correct++;
    });
    return Math.round((correct / targetIds.length) * 100);
  }

  function goToResult() {
    setShowComplete(false);
    setLastResult({ level, moves, elapsed, checks });
    navigate('/result');
  }

  function retryLevel() {
    setShowTimeout(false);
    startLevel(level);
  }

  const remainingClass =
    remaining < 60 ? 'text-danger text-glow-red animate-pulse-fast' : remaining < 180 ? 'text-amber text-glow-amber' : 'text-green text-glow-green';

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-5 pb-10">
      <div className="flex items-center justify-between mb-3.5 pb-3.5 border-b border-border flex-wrap gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="font-mono text-[11px] text-muted tracking-[0.1em]">{roundData.label}</div>
          <div className="text-[20px] font-bold text-ink">{roundData.round.title}</div>
        </div>
        <div className="flex gap-6 items-center">
          <TimerBox label="MOVES" value={moves} className="text-cyan" />
          <TimerBox label="ELAPSED" value={fmtTime(elapsed)} className="text-green text-glow-green" />
          <TimerBox label="REMAINING" value={fmtTime(remaining)} className={remainingClass} />
        </div>
      </div>

      <div className="h-[3px] bg-bg3 rounded-full mb-4.5 overflow-hidden">
        <div
          className="h-full bg-green rounded-full shadow-[0_0_8px_#00ff41] transition-[width]"
          style={{ width: `${accuracy}%` }}
        />
      </div>

      <div className="mb-3.5 bg-bg3 border border-border2 rounded overflow-hidden">
        <div className="font-mono text-[10px] text-amber px-3 py-1.5 border-b border-border2 tracking-[0.1em]">
          &gt; TARGET_OUTPUT — match this exactly
        </div>
        <div className="h-[180px] bg-white">
          <iframe
            title="target"
            sandbox="allow-same-origin"
            srcDoc={roundData.round.targetHTML}
            className="w-full h-full border-none"
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_1fr] gap-3.5 items-start">
          {/* Source blocks panel */}
          <div className="bg-panel border border-border rounded-md overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-border font-mono text-[11px] text-green tracking-[0.1em] flex items-center gap-2 before:content-['//'] before:text-muted">
              SCRAMBLED_BLOCKS
            </div>
            <div className="p-3">
              <div className="flex gap-1.5 mb-2.5">
                {roundData.round.tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`font-mono text-[11px] border rounded-sm px-3 py-1 tracking-[0.08em] transition-all ${
                      currentTab === t
                        ? 'border-green text-green bg-green-dim shadow-[0_0_8px_var(--tw-shadow-color)] shadow-green-dim'
                        : 'border-border text-muted'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 min-h-[400px]">
                {sourceBlocks.map((b) => (
                  <SourceBlock key={b.id} block={b} onClick={() => addBlock(b)} />
                ))}
              </div>
            </div>
          </div>

          {/* Dropzone panel */}
          <div className="bg-panel border border-border rounded-md overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-border font-mono text-[11px] text-green tracking-[0.1em] flex items-center gap-2 before:content-['//'] before:text-muted">
              YOUR_CODE{' '}
              <span className="text-muted text-[10px] font-normal">drag to arrange</span>
            </div>
            <div className="p-3">
              <DropZone placedBlocks={placedBlocks} onRemove={removeBlock} />
            </div>
          </div>

          {/* Live preview panel */}
          <div className="bg-panel border border-border rounded-md overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-border font-mono text-[11px] text-green tracking-[0.1em] flex items-center gap-2 before:content-['//'] before:text-muted">
              LIVE_PREVIEW
            </div>
            <div className="p-3">
              <div className="bg-white rounded overflow-hidden h-[440px]">
                <div className="h-7 bg-[#e5e5e5] flex items-center px-2.5 gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <iframe
                  title="preview"
                  sandbox="allow-same-origin"
                  srcDoc={placedBlocks.map((b) => b.code).join('\n')}
                  className="w-full border-none bg-white"
                  style={{ height: 'calc(440px - 28px)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      <div className="flex items-center justify-between mt-3.5 flex-wrap gap-2.5">
        {feedback ? (
          <div
            className={`px-3.5 py-2.5 rounded-sm font-mono text-[12px] leading-relaxed ${
              feedback.kind === 'good'
                ? 'bg-[#00ff4112] border border-[#00ff4133] text-green'
                : feedback.kind === 'bad'
                ? 'bg-[#ffb70010] border border-[#ffb70030] text-amber'
                : 'bg-[#ff3c3c10] border border-[#ff3c3c30] text-danger'
            }`}
          >
            &gt; {feedback.msg}
          </div>
        ) : (
          <div />
        )}
        <div className="flex gap-2 items-center">
          <div className="inline-flex items-center gap-1.5 bg-panel border border-border rounded-sm px-3.5 py-1.5 font-mono text-[13px] text-green text-glow-green">
            ACC: <span>{accuracy}%</span>
          </div>
          <button
            onClick={() => {
              resetRound();
              setFeedback(null);
            }}
            className="bg-transparent border border-[#2a3a2c] text-ink2 font-mono text-[12px] px-4.5 py-2 rounded-sm tracking-[0.08em] hover:border-muted hover:text-ink transition-all"
          >
            [ RESET ]
          </button>
          <button
            onClick={handleCheck}
            className="bg-transparent border border-green text-green font-mono text-[12px] px-6 py-2 rounded-sm tracking-[0.1em] shadow-[0_0_10px_var(--tw-shadow-color)] shadow-green-dim transition-all hover:bg-green-dim hover:shadow-green-glow"
          >
            [ CHECK ]
          </button>
        </div>
      </div>

      <RoundCompleteModal
        show={showComplete}
        level={level}
        stats={{ moves, checks, elapsed }}
        onNext={goToResult}
      />
      <TimeoutModal show={showTimeout} onRetry={retryLevel} onHome={() => navigate('/')} />
    </div>
  );
}

function TimerBox({ label, value, className }) {
  return (
    <div className="text-center bg-panel border border-border rounded px-4 py-2">
      <div className="font-mono text-[9px] text-muted tracking-[0.1em]">{label}</div>
      <div className={`font-mono text-[22px] tracking-[0.06em] ${className}`}>{value}</div>
    </div>
  );
}

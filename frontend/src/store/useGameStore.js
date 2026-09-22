import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEVELS } from '../data/levels.js';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ---- persisted progress ----
      unlocked: [1],
      completed: [],

      // ---- current run (not persisted across reload, reset per level) ----
      currentLevel: null,
      currentTab: 'HTML',
      sourceBlocks: [], // blocks still in the "scrambled" pool for the active tab
      placedBlocks: [], // blocks the player has arranged, in order, across all tabs combined
      moves: 0,
      checks: 0,
      elapsed: 0,
      accuracy: 0,
      lastResult: null, // { level, moves, elapsed, checks, score }

      isUnlocked: (lv) => get().unlocked.includes(lv),
      isCompleted: (lv) => get().completed.includes(lv),

      unlockLevel: (lv) =>
        set((s) => (s.unlocked.includes(lv) ? s : { unlocked: [...s.unlocked, lv] })),

      markCompleted: (lv) =>
        set((s) => (s.completed.includes(lv) ? s : { completed: [...s.completed, lv] })),

      startLevel: (lv) => {
        const level = LEVELS[lv];
        if (!level) return;
        const firstTab = level.round.tabs[0];
        const tagged = level.round.blocks[firstTab].map((b) => ({ ...b, tab: firstTab }));
        set({
          currentLevel: lv,
          currentTab: firstTab,
          sourceBlocks: shuffle(tagged),
          placedBlocks: [],
          moves: 0,
          checks: 0,
          elapsed: 0,
          accuracy: 0,
          lastResult: null,
        });
      },

      switchTab: (tab) => {
        const { currentLevel, placedBlocks } = get();
        const level = LEVELS[currentLevel];
        if (!level) return;
        // Blocks for this tab that are not already placed go into the source pool.
        const placedIds = new Set(placedBlocks.map((b) => b.id));
        const tagged = level.round.blocks[tab].map((b) => ({ ...b, tab }));
        const pool = tagged.filter((b) => !placedIds.has(b.id));
        set({ currentTab: tab, sourceBlocks: shuffle(pool) });
      },

      addBlock: (block) => {
        set((s) => ({
          sourceBlocks: s.sourceBlocks.filter((b) => b.id !== block.id),
          placedBlocks: [...s.placedBlocks, block],
          moves: s.moves + 1,
        }));
        get().recalcAccuracy();
      },

      removeBlock: (block) => {
        set((s) => ({
          placedBlocks: s.placedBlocks.filter((b) => b.id !== block.id),
          sourceBlocks:
            block.tab === s.currentTab ? [...s.sourceBlocks, block] : s.sourceBlocks,
        }));
        get().recalcAccuracy();
      },

      reorderPlaced: (fromIndex, toIndex) => {
        set((s) => {
          const arr = [...s.placedBlocks];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          return { placedBlocks: arr, moves: s.moves + 1 };
        });
        get().recalcAccuracy();
      },

      recalcAccuracy: () => {
        const { currentLevel, placedBlocks } = get();
        const level = LEVELS[currentLevel];
        if (!level) return;
        const firstTab = level.round.tabs[0];
        const targetIds = level.round.blocks[firstTab].map((b) => b.id);
        const placedInFirstTab = placedBlocks.filter((b) => b.tab === firstTab).map((b) => b.id);
        if (!placedInFirstTab.length) {
          set({ accuracy: 0 });
          return;
        }
        let correct = 0;
        placedInFirstTab.forEach((id, i) => {
          if (targetIds[i] === id) correct++;
        });
        set({ accuracy: Math.round((correct / targetIds.length) * 100) });
      },

      resetRound: () => {
        const { currentLevel, currentTab } = get();
        const level = LEVELS[currentLevel];
        if (!level) return;
        const tagged = level.round.blocks[currentTab].map((b) => ({ ...b, tab: currentTab }));
        set({
          placedBlocks: [],
          sourceBlocks: shuffle(tagged),
          moves: 0,
          accuracy: 0,
        });
      },

      tick: () => set((s) => ({ elapsed: s.elapsed + 1 })),

      incrementChecks: () => set((s) => ({ checks: s.checks + 1 })),

      setAccuracy: (acc) => set({ accuracy: acc }),

      setLastResult: (result) => set({ lastResult: result }),
    }),
    {
      name: 'pixel-puzzle-progress',
      // Only persist long-term progress, not the volatile in-round state.
      partialize: (s) => ({ unlocked: s.unlocked, completed: s.completed }),
    }
  )
);

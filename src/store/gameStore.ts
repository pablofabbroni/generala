"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, GameState, Player, Variants } from "@/types/game";
import { uid } from "@/lib/utils";
import { getCategories } from "@/lib/categories";

const defaultVariants: Variants = {
  minorStraight: false,
  doubleGenerala: false,
  upperBonus63: true,
};

const defaultPlayers = (): Player[] => ([
  { id: uid("p"), name: "Jugador 1", color: "#22c55e" },
  { id: uid("p"), name: "Jugador 2", color: "#3b82f6" },
]);

type ModalState = { playerId: string; category: Category } | null;

type GameStore = GameState & {
  modal: ModalState;
  setVariants: (v: Partial<Variants>) => void;
  setPlayersCount: (n: number) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  setScore: (playerId: string, category: Category, value: number) => void;
  clearScore: (playerId: string, category: Category) => void;
  openModal: (playerId: string, category: Category) => void;
  closeModal: () => void;
  resetAll: () => void;
  isFinished: () => boolean;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      variants: defaultVariants,
      players: defaultPlayers(),
      scores: {},
      modal: null,

      setVariants: (v) => set((s) => ({ variants: { ...s.variants, ...v } })),

      setPlayersCount: (n) => set((s) => {
        const next = [...s.players];
        const clamped = Math.max(1, Math.min(4, n));
        if (next.length > clamped) next.length = clamped;
        while (next.length < clamped) {
          next.push({ id: uid("p"), name: `Jugador ${next.length + 1}`, color: pickDefaultColor(next.length) });
        }
        const nextScores = { ...s.scores };
        for (const p of next) nextScores[p.id] = nextScores[p.id] ?? {};
        const validIds = new Set(next.map(p => p.id));
        for (const id of Object.keys(nextScores)) if (!validIds.has(id)) delete nextScores[id];
        return { players: next, scores: nextScores };
      }),

      updatePlayer: (id, patch) => set((s) => ({
        players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),

      setScore: (playerId, category, value) => set((s) => ({
        scores: {
          ...s.scores,
          [playerId]: { ...(s.scores[playerId] ?? {}), [category]: value },
        },
      })),

      clearScore: (playerId, category) => set((s) => {
        const current = { ...(s.scores[playerId] ?? {}) };
        delete current[category];
        return { scores: { ...s.scores, [playerId]: current } };
      }),

      openModal: (playerId, category) => set({ modal: { playerId, category } }),
      closeModal: () => set({ modal: null }),

      resetAll: () => set({
        variants: defaultVariants,
        players: defaultPlayers(),
        scores: {},
        modal: null,
      }),

      isFinished: () => {
        const { players, scores, variants } = get();
        const categories = getCategories(variants);
        return players.every((p) =>
          categories.every((cat) => scores[p.id]?.[cat] !== undefined)
        );
      },
    }),
    {
      name: "generala-counter-mvp",
      version: 2,
    }
  )
);

function pickDefaultColor(i: number) {
  const palette = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899"];
  return palette[i % palette.length];
}

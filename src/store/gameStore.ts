"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, GameState, Player, Variants, GamePhase, DiceState, GameMode } from "@/types/game";
import { uid } from "@/lib/utils";
import { getCategories } from "@/lib/categories";
import { calculatePotentialScores, isServido } from "@/lib/game/scoreCalculator";
import { rollDice as rollDiceLogic, createInitialDice } from "@/lib/game/diceEngine";

const defaultVariants: Variants = {
  minorStraight: false,
  doubleGenerala: false,
  upperBonus63: true,
  chance: true,
};

const defaultPlayers = (): Player[] => ([
  { id: uid("p"), name: "Jugador 1", color: "#22c55e", isCPU: false },
  { id: uid("v_cpu"), name: "Jugador 2", color: "#3b82f6", isCPU: false },
]);

const initialDice = createInitialDice();

type ModalState = { playerId: string; category: Category } | null;

type GameStore = GameState & {
  modal: ModalState;
  isMuted: boolean;
  toggleMute: () => void;
  setGameMode: (mode: GameMode) => void;
  setVariants: (v: Partial<Variants>) => void;
  setPlayersCount: (n: number) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;

  // Game Actions
  startGame: () => void;
  rollDice: () => void;
  toggleDieLock: (index: number) => void;
  selectCategory: (category: Category) => void;

  // Scoring Actions (manual entry support)
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
      phase: "setup",
      variants: defaultVariants,
      players: defaultPlayers(),
      scores: {},
      activePlayerId: "",
      dice: initialDice,
      rollsLeft: 3,
      winnerId: null,
      modal: null,
      isMuted: false,
      gameMode: "digital",

      toggleMute: () => set((s: any) => ({ isMuted: !s.isMuted })),
      setGameMode: (gameMode: GameMode) => set((s: GameState) => {
        // When switching to analog, convert all CPUs to human players
        const players = gameMode === "analog"
          ? s.players.map(p => ({ ...p, isCPU: false }))
          : s.players;
        return { gameMode, players };
      }),

      setVariants: (v: Partial<Variants>) => set((s: GameState) => ({ variants: { ...s.variants, ...v } })),

      setPlayersCount: (n: number) => set((s: GameState) => {
        const next = [...s.players];
        const clamped = Math.max(1, Math.min(4, n));
        if (next.length > clamped) next.length = clamped;
        while (next.length < clamped) {
          next.push({
            id: uid("p"),
            name: `Jugador ${next.length + 1}`,
            color: pickDefaultColor(next.length),
            isCPU: false
          });
        }
        const nextScores = { ...s.scores };
        for (const p of next) nextScores[p.id] = nextScores[p.id] ?? {};
        const validIds = new Set(next.map(p => p.id));
        for (const id of Object.keys(nextScores)) if (!validIds.has(id)) delete nextScores[id];
        return { players: next, scores: nextScores };
      }),

      updatePlayer: (id: string, patch: Partial<Player>) => set((s: GameState) => ({
        players: s.players.map((p: Player) => (p.id === id ? { ...p, ...patch } : p)),
      })),

      startGame: () => set((s: GameState) => ({
        phase: "playing",
        activePlayerId: s.players[0].id,
        rollsLeft: 3,
        dice: createInitialDice().map(d => ({ ...d, locked: false })),
        scores: Object.fromEntries(s.players.map(p => [p.id, {}])),
        winnerId: null,
      })),

      rollDice: () => set((s: GameState) => {
        if (s.rollsLeft <= 0) return {};
        const nextDice = rollDiceLogic(s.dice);
        return {
          dice: nextDice,
          rollsLeft: s.rollsLeft - 1,
        };
      }),

      toggleDieLock: (index: number) => set((s: GameState) => {
        if (s.rollsLeft === 3) return {};
        const nextDice = [...s.dice];
        nextDice[index] = { ...nextDice[index], locked: !nextDice[index].locked };
        return { dice: nextDice };
      }),

      selectCategory: (category: Category) => set((s: GameState) => {
        const potentialScores = calculatePotentialScores(s.dice);
        const baseScore = potentialScores[category] || 0;

        // Bonus servido (+5) for major games
        const isGameServido = isServido(s.rollsLeft);
        const isMajorGame = ["majorStraight", "full", "poker", "generala"].includes(category);
        const finalScore = baseScore > 0 && isGameServido && isMajorGame ? baseScore + 5 : baseScore;

        const nextScores = {
          ...s.scores,
          [s.activePlayerId]: {
            ...(s.scores[s.activePlayerId] || {}),
            [category]: finalScore
          }
        };

        const currentPlayerIdx = s.players.findIndex(p => p.id === s.activePlayerId);
        const nextPlayerIdx = (currentPlayerIdx + 1) % s.players.length;
        const nextPlayerId = s.players[nextPlayerIdx].id;

        // Check if game is finished
        const categories = getCategories(s.variants);
        const isFinished = s.players.every((p: Player) =>
          categories.every((cat) => (p.id === s.activePlayerId && cat === category) || nextScores[p.id]?.[cat] !== undefined)
        );

        return {
          scores: nextScores,
          activePlayerId: nextPlayerId,
          rollsLeft: 3,
          dice: createInitialDice().map(d => ({ ...d, locked: false })),
          phase: isFinished ? "gameOver" : "playing",
        };
      }),

      setScore: (playerId: string, category: Category, value: number) => set((s: GameState) => {
        const nextScores = {
          ...s.scores,
          [playerId]: { ...(s.scores[playerId] ?? {}), [category]: value },
        };

        const currentPlayerIdx = s.players.findIndex(p => p.id === s.activePlayerId);
        const nextPlayerIdx = (currentPlayerIdx + 1) % s.players.length;
        const nextPlayerId = s.players[nextPlayerIdx].id;

        // Check if game is finished
        const categories = getCategories(s.variants);
        const isFinished = s.players.every((p: Player) =>
          categories.every((cat) => (p.id === s.activePlayerId && cat === category) || nextScores[p.id]?.[cat] !== undefined)
        );

        return {
          scores: nextScores,
          activePlayerId: nextPlayerId,
          phase: isFinished ? "gameOver" : "playing",
        };
      }),

      clearScore: (playerId: string, category: Category) => set((s: GameState) => {
        const current = { ...(s.scores[playerId] ?? {}) };
        delete (current as any)[category];
        return { scores: { ...s.scores, [playerId]: current } };
      }),

      openModal: (playerId: string, category: Category) => set({ modal: { playerId, category } } as any),
      closeModal: () => set({ modal: null } as any),

      resetAll: () => set({
        phase: "setup",
        variants: defaultVariants,
        players: defaultPlayers(),
        scores: {},
        activePlayerId: "",
        dice: initialDice,
        rollsLeft: 3,
        winnerId: null,
        modal: null,
      } as any),

      isFinished: () => {
        const { players, scores, variants } = get();
        const categories = getCategories(variants);
        return players.every((p: Player) =>
          categories.every((cat) => scores[p.id]?.[cat] !== undefined)
        );
      },
    }),
    {
      name: "generala-v2-store",
      version: 5,
    }
  )
);

function pickDefaultColor(i: number) {
  const palette = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899"];
  return palette[i % palette.length];
}

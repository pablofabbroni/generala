import type { Category, ScoresByPlayer, Variants } from "@/types/game";

export function upperSum(s: Partial<Record<Category, number>>) {
  return (s.ones ?? 0) + (s.twos ?? 0) + (s.threes ?? 0) + (s.fours ?? 0) + (s.fives ?? 0) + (s.sixes ?? 0);
}

export function bonus63(s: Partial<Record<Category, number>>, v: Variants) {
  if (!v.upperBonus63) return 0;
  return upperSum(s) >= 63 ? 35 : 0;
}

export function totalForPlayer(s: Partial<Record<Category, number>>, v: Variants) {
  const base = Object.values(s).reduce((a, b) => a + (b ?? 0), 0);
  return base + bonus63(s, v);
}

export function getRanking(players: { id: string; name: string; color: string }[], scores: ScoresByPlayer, v: Variants) {
  return [...players]
    .map((p) => ({ ...p, total: totalForPlayer(scores[p.id] ?? {}, v) }))
    .sort((a, b) => b.total - a.total);
}

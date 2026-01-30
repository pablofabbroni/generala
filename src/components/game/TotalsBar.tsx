"use client";
import { Card, CardContent } from "@/components/ui/Card";
import type { Player, ScoresByPlayer, Variants } from "@/types/game";
import { PlayerBadge } from "@/components/common/PlayerBadge";
import { bonus63, totalForPlayer, upperSum } from "@/lib/scoring";

export function TotalsBar({ players, scores, variants }: { players: Player[]; scores: ScoresByPlayer; variants: Variants }) {
  return (
    <Card className="sticky bottom-4">
      <CardContent className="flex flex-col gap-3">
        <div className="text-sm font-semibold">Totales</div>
        <div className="grid gap-2 md:grid-cols-2">
          {players.map((p) => {
            const s = scores[p.id] ?? {};
            const up = upperSum(s);
            const b = bonus63(s, variants);
            const total = totalForPlayer(s, variants);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <PlayerBadge name={p.name} color={p.color} />
                <div className="text-right">
                  {variants.upperBonus63 ? (
                    <div className="text-[11px] text-white/60 tabular-nums">
                      1..6: {up} {b ? `(+${b})` : ""}
                    </div>
                  ) : null}
                  <div className="text-sm font-semibold tabular-nums">{total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

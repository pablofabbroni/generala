"use client";
import { Card, CardContent } from "@/components/ui/Card";
import type { Player, ScoresByPlayer, Variants } from "@/types/game";
import { PlayerBadge } from "@/components/common/PlayerBadge";
import { bonus63, totalForPlayer, upperSum } from "@/lib/scoring";

export function TotalsBar({ players, scores, variants }: { players: Player[]; scores: ScoresByPlayer; variants: Variants }) {
  return (
    <Card className="sticky bottom-4 border-white/10 bg-zinc-950/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      <CardContent className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tabla de Totales</div>
          <div className="h-px flex-1 mx-4 bg-white/10" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {players.map((p) => {
            const s = scores[p.id] ?? {};
            const total = totalForPlayer(s, variants);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-black/40 px-5 py-3.5 transition-all hover:bg-black/60 shadow-lg">
                <PlayerBadge name={p.name} color={p.color} />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Puntos</span>
                  <div className="text-2xl font-black tabular-nums text-amber-500 text-glow-amber">{total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

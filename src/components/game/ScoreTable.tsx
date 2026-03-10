"use client";
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PlayerBadge } from "@/components/common/PlayerBadge";
import { ScoreCell } from "@/components/game/ScoreCell";
import { getCategories, categoryMeta } from "@/lib/categories";
import type { Category, Player, ScoresByPlayer, Variants } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ScoreTable({
  players,
  scores,
  variants,
  onCellClick,
  activePlayerId,
  potentialScores = {},
}: {
  players: Player[];
  scores: ScoresByPlayer;
  variants: Variants;
  onCellClick: (playerId: string, category: Category) => void;
  activePlayerId?: string;
  potentialScores?: Partial<Record<Category, number>>;
}) {
  const categories = getCategories(variants);

  // For mobile view tab selection
  const [mobileActivePlayerId, setMobileActivePlayerId] = React.useState(activePlayerId || players[0]?.id || "");
  React.useEffect(() => {
    if (activePlayerId) setMobileActivePlayerId(activePlayerId);
  }, [activePlayerId]);

  const activePlayer = players.find((p) => p.id === mobileActivePlayerId) ?? players[0];

  return (
    <Card className="overflow-hidden border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/50">Puntajes</div>
            <div className="text-lg font-black text-white uppercase italic tracking-tight">Hoja de Puntuación</div>
          </div>
          {activePlayerId && (
            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 border border-amber-500/30">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Turno Activo
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `120px repeat(${players.length}, minmax(80px, 1fr))`,
              minWidth: `${120 + players.length * 80}px`
            }}
          >
            {/* Table Header: Category + Players */}
            <div className="sticky left-0 z-20 px-4 py-5 text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
              Mesa
            </div>
            {players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "px-2 py-5 border-b border-white/10 border-l border-white/5 transition-colors bg-white/5",
                  p.id === activePlayerId ? "bg-amber-500/20" : ""
                )}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-lg"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name?.[0].toUpperCase()}
                  </div>
                  <span className="text-[9px] font-black text-white uppercase truncate w-16">{p.name}</span>
                </div>
              </div>
            ))}

            {/* Table Body: Categories + Scores */}
            {categories.map((cat, catIdx) => (
              <React.Fragment key={cat}>
                <div className={cn(
                  "sticky left-0 z-20 px-4 py-3.5 flex items-center border-b border-white/10 transition-all bg-zinc-950/90 backdrop-blur-md shadow-xl group/row",
                  catIdx % 2 === 0 ? "bg-zinc-950/95" : "bg-zinc-950/90",
                  "hover:bg-amber-500/5"
                )}>
                  <div className="text-[10px] font-black text-white uppercase tracking-tight leading-none group-hover/row:text-amber-500 transition-colors">
                    {categoryMeta[cat].label}
                  </div>
                </div>
                {players.map((p) => {
                  const score = scores[p.id]?.[cat];
                  const isPreview = p.id === activePlayerId && score === undefined;
                  const value = isPreview ? potentialScores[cat] : score;

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "px-2 py-3 border-b border-white/10 border-l border-white/5 transition-all text-center group/row-cell",
                        p.id === activePlayerId
                          ? (catIdx % 2 === 0 ? "bg-amber-500/[0.12] shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]" : "bg-amber-500/10")
                          : (catIdx % 2 === 0 ? "bg-white/[0.04]" : "bg-transparent"),
                        "group-hover/row:bg-amber-500/5"
                      )}
                    >
                      <ScoreCell
                        value={value}
                        onClick={() => onCellClick(p.id, cat)}
                        color={p.color}
                        isPreview={isPreview && value !== undefined}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

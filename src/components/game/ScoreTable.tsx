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
            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Turno Activo
              </div>
            </div>
          )}
        </div>

        {players.length > 1 ? (
          <div className="flex flex-wrap gap-2 md:hidden">
            {players.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={p.id === mobileActivePlayerId ? "primary" : "secondary"}
                onClick={() => setMobileActivePlayerId(p.id)}
                className={cn(
                  "rounded-xl transition-all border border-white/5",
                  p.id === activePlayerId && "ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-900 shadow-lg shadow-amber-500/20"
                )}
              >
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: p.color }} />
                <span className="max-w-[8rem] truncate font-black text-[11px] uppercase tracking-tighter">{p.name}</span>
              </Button>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="p-0">
        <div className="md:hidden">
          <div className="grid" style={{ gridTemplateColumns: "1fr 108px" }}>
            {categories.map((cat, idx) => {
              const score = scores[activePlayer.id]?.[cat];
              const isPreview = activePlayer.id === activePlayerId && score === undefined;
              const value = isPreview ? potentialScores[cat] : score;

              return (
                <React.Fragment key={cat}>
                  <div className={cn(
                    "px-5 py-4 flex items-center border-b border-white/10 transition-colors group",
                    idx % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent",
                    activePlayerId === activePlayer.id && "hover:bg-amber-500/5"
                  )}>
                    <div className="text-[11px] font-black text-white uppercase tracking-wider">{categoryMeta[cat].label}</div>
                  </div>
                  <div className={cn(
                    "px-4 py-3 border-b border-white/10",
                    idx % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent",
                    activePlayerId === activePlayer.id && "hover:bg-amber-500/5"
                  )}>
                    {activePlayer ? (
                      <ScoreCell
                        value={value}
                        onClick={() => onCellClick(activePlayer.id, cat)}
                        color={activePlayer.color}
                        isPreview={isPreview && value !== undefined}
                      />
                    ) : null}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${players.length}, minmax(100px, 1fr))` }}>
            <div className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/10 bg-black/40">Categoría</div>
            {players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "px-4 py-5 border-b border-white/10 transition-colors bg-black/40",
                  p.id === activePlayerId ? "bg-amber-500/10" : ""
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <PlayerBadge name={p.name} color={p.color} />
                  {p.id === activePlayerId && <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.15em] animate-pulse">Su turno</span>}
                </div>
              </div>
            ))}

            {categories.map((cat, catIdx) => (
              <React.Fragment key={cat}>
                <div className={cn(
                  "px-6 py-3.5 flex items-center border-b border-white/10 transition-all group",
                  catIdx % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent",
                  "hover:bg-white/[0.08]"
                )}>
                  <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">{categoryMeta[cat].label}</div>
                </div>
                {players.map((p) => {
                  const score = scores[p.id]?.[cat];
                  const isPreview = p.id === activePlayerId && score === undefined;
                  const value = isPreview ? potentialScores[cat] : score;

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "px-4 py-3 border-b border-white/10 transition-all",
                        p.id === activePlayerId ? (catIdx % 2 === 0 ? "bg-amber-500/[0.08]" : "bg-amber-500/[0.04]") : (catIdx % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent"),
                        "hover:brightness-125"
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

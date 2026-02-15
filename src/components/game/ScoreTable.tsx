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
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Hoja de Puntuación</div>
          {activePlayerId && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse">
              Turno Activo
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
                className={cn(p.id === activePlayerId && "ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-900")}
              >
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="max-w-[8rem] truncate">{p.name}</span>
              </Button>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="p-0">
        <div className="md:hidden">
          <div className="grid" style={{ gridTemplateColumns: "1fr 108px" }}>
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Categoría</div>
            <div className="px-4 py-2">{activePlayer ? <PlayerBadge name={activePlayer.name} color={activePlayer.color} /> : null}</div>
            <div className="col-span-full h-px bg-white/5" />

            {categories.map((cat) => {
              const score = scores[activePlayer.id]?.[cat];
              const isPreview = activePlayer.id === activePlayerId && score === undefined;
              const value = isPreview ? potentialScores[cat] : score;

              return (
                <React.Fragment key={cat}>
                  <div className="px-4 py-2 flex items-center">
                    <div className="text-sm font-medium text-white/80">{categoryMeta[cat].label}</div>
                  </div>
                  <div className="px-4 py-2">
                    {activePlayer ? (
                      <ScoreCell
                        value={value}
                        onClick={() => onCellClick(activePlayer.id, cat)}
                        color={activePlayer.color}
                        isPreview={isPreview && value !== undefined}
                      />
                    ) : null}
                  </div>
                  <div className="col-span-full h-px bg-white/5" />
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${players.length}, minmax(100px, 1fr))` }}>
            <div className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/5">Categoría</div>
            {players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "px-4 py-4 border-b border-white/5 transition-colors",
                  p.id === activePlayerId ? "bg-amber-500/5" : ""
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <PlayerBadge name={p.name} color={p.color} />
                  {p.id === activePlayerId && <span className="text-[8px] font-bold text-amber-500 uppercase">Activo</span>}
                </div>
              </div>
            ))}

            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <div className="px-4 py-2 flex items-center border-b border-white/5 bg-white/[0.02]">
                  <div className="text-sm font-medium text-white/70">{categoryMeta[cat].label}</div>
                </div>
                {players.map((p) => {
                  const score = scores[p.id]?.[cat];
                  const isPreview = p.id === activePlayerId && score === undefined;
                  const value = isPreview ? potentialScores[cat] : score;

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "px-4 py-2 border-b border-white/5 transition-colors",
                        p.id === activePlayerId ? "bg-amber-500/5" : ""
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

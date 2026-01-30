"use client";
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PlayerBadge } from "@/components/common/PlayerBadge";
import { ScoreCell } from "@/components/game/ScoreCell";
import { getCategories, categoryMeta } from "@/lib/categories";
import type { Category, Player, ScoresByPlayer, Variants } from "@/types/game";
import { Button } from "@/components/ui/Button";

export function ScoreTable({
  players,
  scores,
  variants,
  onCellClick,
}: {
  players: Player[];
  scores: ScoresByPlayer;
  variants: Variants;
  onCellClick: (playerId: string, category: Category) => void;
}) {
  const categories = getCategories(variants);

  const [activePlayerId, setActivePlayerId] = React.useState(players[0]?.id ?? "");
  React.useEffect(() => {
    if (!players.some((p) => p.id === activePlayerId)) setActivePlayerId(players[0]?.id ?? "");
  }, [players, activePlayerId]);

  const activePlayer = players.find((p) => p.id === activePlayerId) ?? players[0];

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="text-sm font-semibold">Contador</div>
        <div className="text-xs text-white/60">Tocá una celda vacía para cargar puntaje.</div>

        {players.length > 1 ? (
          <div className="flex flex-wrap gap-2 md:hidden">
            {players.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={p.id === activePlayerId ? "primary" : "secondary"}
                onClick={() => setActivePlayerId(p.id)}
              >
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="max-w-[8rem] truncate">{p.name}</span>
              </Button>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="md:hidden">
          <div className="grid" style={{ gridTemplateColumns: "1fr 108px" }}>
            <div className="px-2 py-2 text-xs text-white/60">Categoría</div>
            <div className="px-2 py-2">{activePlayer ? <PlayerBadge name={activePlayer.name} color={activePlayer.color} /> : null}</div>
            <div className="col-span-full h-px bg-white/10" />

            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <div className="px-2 py-2">
                  <div className="text-sm font-semibold">{categoryMeta[cat].label}</div>
                </div>
                <div className="px-2 py-2">
                  {activePlayer ? (
                    <ScoreCell
                      value={scores[activePlayer.id]?.[cat]}
                      onClick={() => onCellClick(activePlayer.id, cat)}
                      color={activePlayer.color}
                    />
                  ) : null}
                </div>
                <div className="col-span-full h-px bg-white/10" />
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: `150px repeat(${players.length}, minmax(74px, 1fr))` }}>
            <div className="px-2 py-2 text-xs text-white/60">Categoría</div>
            {players.map((p) => (
              <div key={p.id} className="px-2 py-2">
                <PlayerBadge name={p.name} color={p.color} />
              </div>
            ))}

            <div className="col-span-full h-px bg-white/10" />

            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <div className="px-2 py-2">
                  <div className="text-sm font-semibold">{categoryMeta[cat].label}</div>
                </div>
                {players.map((p) => (
                  <div key={p.id} className="px-2 py-2">
                    <ScoreCell
                      value={scores[p.id]?.[cat]}
                      onClick={() => onCellClick(p.id, cat)}
                      color={p.color}
                    />
                  </div>
                ))}
                <div className="col-span-full h-px bg-white/10" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { Player } from "@/types/game";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/Switch";
import { useGameStore } from "@/store/gameStore";

const preset = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#a855f7", "#06b6d4"];

export function PlayerCard({ player, onChange }: { player: Player; onChange: (patch: Partial<Player>) => void }) {
  const gameMode = useGameStore((s) => s.gameMode);

  return (
    <Card className="overflow-hidden border-white/10 bg-zinc-900/50">
      <CardHeader className="flex flex-row items-center justify-between gap-3 bg-white/5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: player.color }} />
          <div className="text-xs font-bold uppercase tracking-wider text-white/50">Jugador</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            aria-label="Color"
            type="color"
            value={player.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-6 w-8 rounded-lg border border-white/10 bg-transparent p-0 cursor-pointer"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1">
          <Input
            value={player.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nombre"
            className="bg-zinc-950/50 border-white/10"
          />
        </div>

        {gameMode === "digital" && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 border border-white/5">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white/70 uppercase">¿Es CPU?</span>
              <span className="text-[10px] text-white/40">Jugador automático</span>
            </div>
            <Switch
              checked={!!player.isCPU}
              onCheckedChange={(v) => onChange({ isCPU: v, name: v ? `CPU ${player.name || ""}` : player.name.replace("CPU ", "") })}
            />
          </div>
        )}

        {player.isCPU && gameMode === "digital" && (
          <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
            {(["easy", "medium", "hard"] as const).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => onChange({ difficulty: lv })}
                className={cn(
                  "flex-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-tighter rounded-lg transition-all",
                  player.difficulty === lv
                    ? "bg-amber-500 text-black shadow-lg"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                {lv === "easy" ? "Fácil" : lv === "hard" ? "Difícil" : "Medio"}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {preset.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ color: c })}
              className={cn(
                "h-6 w-6 rounded-full border border-white/10 hover:border-amber-500/50 transition-all",
                player.color === c && "ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-900"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Seleccionar color ${c}`}
              type="button"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

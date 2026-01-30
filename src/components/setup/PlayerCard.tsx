"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { Player } from "@/types/game";

const preset = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#a855f7", "#06b6d4"];

export function PlayerCard({ player, onChange }: { player: Player; onChange: (patch: Partial<Player>) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="text-sm font-semibold">Jugador</div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: player.color }} />
          <input
            aria-label="Color"
            type="color"
            value={player.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 w-10 rounded-xl border border-white/10 bg-transparent p-0"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={player.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Nombre" />
        <div className="flex flex-wrap gap-2">
          {preset.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ color: c })}
              className="h-7 w-7 rounded-full border border-white/10 hover:border-white/25 transition"
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

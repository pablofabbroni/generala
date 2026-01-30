"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Trophy } from "lucide-react";

export function RankingModal({
  open,
  onOpenChange,
  ranking,
  onNewGame,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ranking: { id: string; name: string; color: string; total: number }[];
  onNewGame: () => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ranking final"
      footer={
        <div className="grid gap-2">
          <Button size="lg" onClick={onNewGame}>Nueva partida</Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/80">
          <Trophy className="h-4 w-4" />
          <div className="text-xs">Partida completada</div>
        </div>

        <div className="space-y-2">
          {ranking.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 text-center text-sm font-semibold">{idx + 1}°</div>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                <div className="truncate text-sm font-semibold">{p.name}</div>
              </div>
              <div className="tabular-nums text-sm font-semibold">{p.total}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

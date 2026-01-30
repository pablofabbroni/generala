"use client";
import { Button } from "@/components/ui/Button";

export function PlayersCount({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => onChange(Math.max(1, value - 1))}>-</Button>
      <div className="min-w-[3rem] text-center text-sm font-semibold">{value}</div>
      <Button variant="secondary" size="sm" onClick={() => onChange(Math.min(4, value + 1))}>+</Button>
    </div>
  );
}

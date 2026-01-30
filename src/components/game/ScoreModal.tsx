"use client";
import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoryMeta } from "@/lib/categories";
import type { Category, Player, Variants } from "@/types/game";

type Chip = { label: string; value: number; kind?: "normal" | "served" | "strike" };

function faceOptions(face: number): Chip[] {
  const chips: Chip[] = [{ label: "Tachar", value: 0, kind: "strike" }];
  for (let k = 1; k <= 5; k++) chips.push({ label: String(face * k), value: face * k });
  return chips;
}

function categoryChips(category: Category): { chips: Chip[]; allowCustom: boolean } {
  switch (category) {
    case "ones": return { chips: faceOptions(1), allowCustom: true };
    case "twos": return { chips: faceOptions(2), allowCustom: true };
    case "threes": return { chips: faceOptions(3), allowCustom: true };
    case "fours": return { chips: faceOptions(4), allowCustom: true };
    case "fives": return { chips: faceOptions(5), allowCustom: true };
    case "sixes": return { chips: faceOptions(6), allowCustom: true };

    case "minorStraight":
      return { chips: [{ label: "Tachar", value: 0, kind: "strike" }, { label: "15", value: 15 }, { label: "Servido", value: 20, kind: "served" }], allowCustom: true };
    case "majorStraight":
      return { chips: [{ label: "Tachar", value: 0, kind: "strike" }, { label: "20", value: 20 }, { label: "Servido", value: 25, kind: "served" }], allowCustom: true };
    case "full":
      return { chips: [{ label: "Tachar", value: 0, kind: "strike" }, { label: "30", value: 30 }, { label: "Servido", value: 35, kind: "served" }], allowCustom: true };
    case "poker":
      return { chips: [{ label: "Tachar", value: 0, kind: "strike" }, { label: "40", value: 40 }, { label: "Servido", value: 45, kind: "served" }], allowCustom: true };
    case "generala":
      return { chips: [{ label: "Tachar", value: 0, kind: "strike" }, { label: "50", value: 50 }], allowCustom: true };
    case "doubleGenerala":
      return { chips: [{ label: "Tachar", value: 0, kind: "strike" }, { label: "100", value: 100 }], allowCustom: true };
  }
}

export function ScoreModal({
  open,
  onOpenChange,
  player,
  category,
  variants,
  currentValue,
  onSave,
  onClear,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  player: Player | null;
  category: Category | null;
  variants: Variants;
  currentValue: number | undefined;
  onSave: (value: number) => void;
  onClear: () => void;
}) {
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    if (open) setValue(currentValue?.toString() ?? "");
  }, [open, currentValue]);

  if (!player || !category) return null;

  const title = `${player.name} — ${categoryMeta[category].label}`;
  const { chips, allowCustom } = categoryChips(category);

  const parsed = value.trim() === "" ? NaN : Number(value);
  const valid = Number.isFinite(parsed) && parsed >= 0 && parsed <= 999;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
          >
            Borrar
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: player.color }} />
          <span className="text-xs text-white/70">Elegí un chip y se guarda automáticamente.</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {chips.map((c) => (
            <button
              key={`${c.label}_${c.value}`}
              type="button"
              onClick={() => {
                onSave(c.value);
                onOpenChange(false);
              }}
              className={[
                "rounded-2xl border px-3 py-2 text-sm transition tabular-nums",
                c.kind === "strike"
                  ? "border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
                  : c.kind === "served"
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
                  : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
              ].join(" ")}
            >
              {c.label}
            </button>
          ))}
        </div>

        {allowCustom ? (
          <div className="space-y-2">
            <div className="text-xs text-white/60">O ingresá un valor manual</div>
            <div className="flex gap-2">
              <Input
                inputMode="numeric"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ej: 30"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && valid) {
                    onSave(parsed);
                    onOpenChange(false);
                  }
                }}
              />
              <Button
                variant="secondary"
                disabled={!valid}
                onClick={() => {
                  if (!valid) return;
                  onSave(parsed);
                  onOpenChange(false);
                }}
              >
                Guardar
              </Button>
            </div>
            {!valid && value.trim() !== "" ? (
              <div className="text-xs text-rose-300">Ingresá un número válido (0 a 999).</div>
            ) : null}
          </div>
        ) : null}

        <div className="text-[11px] text-white/45 leading-relaxed">
          “Servido” representa +5 puntos sobre el valor base (no aplica a Generalas).
        </div>
      </div>
    </Modal>
  );
}

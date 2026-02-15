"use client";
import { cn } from "@/lib/utils";

export function ScoreCell({
  value,
  onClick,
  color,
  isPreview = false,
}: {
  value: number | undefined;
  onClick: () => void;
  color: string;
  isPreview?: boolean;
}) {
  const filled = value !== undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={filled && !isPreview}
      className={cn(
        "group w-full min-w-[4.5rem] rounded-2xl border px-3 py-2 text-sm transition",
        filled
          ? isPreview
            ? "border-amber-500/30 bg-amber-500/5 text-amber-500/60 animate-pulse cursor-pointer"
            : "border-white/10 bg-white/5 text-white/90"
          : "border-white/10 bg-white/0 hover:bg-white/5 text-white/70"
      )}
      style={filled && !isPreview ? { boxShadow: `inset 0 0 0 1px ${color}22` } : undefined}
      aria-label={filled ? `Puntaje ${value}` : "Cargar puntaje"}
    >
      <div className="flex items-center justify-center gap-2">
        {!filled && !isPreview ? (
          <span className="text-white/45 group-hover:text-white/70">+</span>
        ) : null}
        <span className={cn("tabular-nums font-semibold", !filled && "font-medium")}>
          {filled ? value : ""}
        </span>
      </div>
    </button>
  );
}

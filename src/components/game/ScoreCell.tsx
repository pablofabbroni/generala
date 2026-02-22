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
        "group w-full min-w-[4.5rem] rounded-2xl border-2 px-3 py-2 text-sm transition-all duration-300",
        filled
          ? isPreview
            ? "border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse cursor-pointer"
            : "border-white/20 bg-white/10 text-white shadow-lg"
          : "border-white/10 bg-white/0 hover:bg-white/10 hover:border-white/30 text-white/80 active:scale-95"
      )}
      style={filled && !isPreview ? { borderLeftColor: color, borderLeftWidth: "4px" } : undefined}
      aria-label={filled ? `Puntaje ${value}` : "Cargar puntaje"}
    >
      <div className="flex items-center justify-center gap-2">
        {!filled && !isPreview ? (
          <span className="text-white/40 group-hover:text-white/100 transition-colors font-black">+</span>
        ) : null}
        <span className={cn("tabular-nums font-black tracking-tight", !filled && "font-bold opacity-0 group-hover:opacity-100")}>
          {filled ? value : "—"}
        </span>
      </div>
    </button>
  );
}

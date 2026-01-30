"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function PlayerBadge({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90", className)}>
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate max-w-[9rem]">{name}</span>
    </span>
  );
}

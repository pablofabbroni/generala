"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CPUScoreNotificationProps {
    playerName: string;
    category: string;
    score: number;
    visible: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    ones: "Unos",
    twos: "Doses",
    threes: "Treses",
    fours: "Cuatros",
    fives: "Cincos",
    sixes: "Seises",
    straight: "Escalera",
    full: "Full",
    poker: "Póker",
    generala: "¡GENERALA!",
    doubleGenerala: "¡GENERALA DOBLE!",
    chance: "Chance",
};

export function CPUScoreNotification({ playerName, category, score, visible }: CPUScoreNotificationProps) {
    return (
        <div
            className={cn(
                "fixed inset-x-0 top-24 z-50 flex justify-center pointer-events-none transition-all duration-500",
                visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
        >
            <div className={cn(
                "flex items-center gap-4 px-8 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl",
                score > 0
                    ? "bg-emerald-950/90 border-emerald-400/40 shadow-emerald-500/20"
                    : "bg-zinc-900/90 border-white/10"
            )}>
                {/* Icon */}
                <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl font-black",
                    score > 0 ? "bg-emerald-500 text-black" : "bg-zinc-700 text-white/60"
                )}>
                    {score > 0 ? "🎯" : "✗"}
                </div>

                {/* Text */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                        {playerName} anotó
                    </p>
                    <p className={cn(
                        "text-xl font-black",
                        score > 0 ? "text-emerald-400" : "text-white/60"
                    )}>
                        {CATEGORY_LABELS[category] || category}
                    </p>
                    {score > 0 && (
                        <p className="text-sm font-bold text-emerald-300">+{score} puntos</p>
                    )}
                </div>

                {/* Score badge */}
                {score > 0 && (
                    <div className="ml-2 h-14 w-14 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                        <span className="text-xl font-black text-black">{score}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

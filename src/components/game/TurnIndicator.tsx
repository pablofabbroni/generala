"use client";

import { Player } from "@/types/game";
import { PlayerBadge } from "@/components/common/PlayerBadge";
import { cn } from "@/lib/utils";

interface TurnIndicatorProps {
    activePlayer: Player;
    isCPU?: boolean;
}

export function TurnIndicator({ activePlayer, isCPU }: TurnIndicatorProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 rounded-full bg-white/5 px-6 py-3 border border-white/10 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Turno de</span>
                <PlayerBadge name={activePlayer.name} color={activePlayer.color} />
            </div>
            {isCPU && (
                <span className="text-[10px] font-bold uppercase tracking-tighter text-amber-500 animate-pulse">
                    La CPU está pensando...
                </span>
            )}
        </div>
    );
}

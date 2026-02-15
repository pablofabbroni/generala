"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PlayerBadge } from "@/components/common/PlayerBadge";
import { Trophy, RotateCcw, Home } from "lucide-react";
import confetti from "canvas-confetti";
import { useSound } from "@/hooks/useSound";

interface GameOverModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ranking: { playerId: string; name: string; color: string; total: number }[];
    onNewGame: () => void;
    onGoHome: () => void;
}

export function GameOverModal({
    open,
    onOpenChange,
    ranking,
    onNewGame,
    onGoHome
}: GameOverModalProps) {
    const { playSound } = useSound();
    const winner = ranking[0];

    React.useEffect(() => {
        if (open) {
            playSound("win");
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [open, playSound]);

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            className="max-w-md"
        >
            <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    <Trophy className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-center text-2xl font-black tracking-tight text-white mb-6">
                    ¡Tenemos un Ganador!
                </h2>

                <div className="w-full space-y-6">
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 p-8 border border-white/10 shadow-inner">
                        <PlayerBadge name={winner.name} color={winner.color} />
                        <span className="text-4xl font-black text-white">{winner.total} pts</span>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2 text-center">Tabla de Posiciones</p>
                        <div className="space-y-1">
                            {ranking.map((player, i) => (
                                <div key={player.playerId} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 border border-transparent hover:border-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-4 text-sm font-bold text-white/30">{i + 1}</span>
                                        <PlayerBadge name={player.name} color={player.color} />
                                    </div>
                                    <span className="font-bold text-white/90">{player.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button variant="secondary" onClick={onGoHome} className="w-full py-6">
                            <Home className="mr-2 h-4 w-4" />
                            Menú
                        </Button>
                        <Button variant="primary" onClick={onNewGame} className="w-full py-6 shadow-lg shadow-amber-500/20">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Revancha
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

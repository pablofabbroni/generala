import * as React from "react";
import dynamic from "next/dynamic";
import { Dice } from "./Dice";

const Dice3DCanvas = dynamic(
    () => import("./Dice3DCanvas").then((mod) => mod.Dice3DCanvas),
    {
        ssr: false,
        loading: () => <div className="h-[300px] w-full bg-black/20 animate-pulse rounded-3xl" />
    }
);
import { Button } from "@/components/ui/Button";
import { Dice6 } from "lucide-react";
import { DiceState } from "@/types/game";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";

interface DiceTrayProps {
    dice: DiceState[];
    rollsLeft: number;
    onRoll: () => void;
    onToggleLock: (index: number) => void;
    disabled?: boolean;
    isCPU?: boolean;
}

export function DiceTray({
    dice,
    rollsLeft,
    onRoll,
    onToggleLock,
    disabled,
    isCPU
}: DiceTrayProps) {
    const { playSound } = useSound();
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleRoll = () => {
        setIsAnimating(true);
        // Nearly instant roll for better pace
        setTimeout(() => {
            playSound("diceRoll");
            onRoll();
            setIsAnimating(false);
        }, 400);
    };

    const handleToggleLock = (index: number) => {
        if (!disabled && rollsLeft !== 3 && rollsLeft !== 0 && !isCPU) {
            playSound("diceLock");
            onToggleLock(index);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 p-4">
            <div className="flex flex-col items-center gap-6 w-full">
                {/* 3D Visual Area */}
                <div className={cn(
                    "w-full relative rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] transition-all duration-700",
                    isCPU ? "h-[300px]" : "h-[300px]"
                )}>
                    <Dice3DCanvas />

                    {/* Vignette Overlay (Local to the tray) */}
                    <div className="casino-vignette absolute inset-0 pointer-events-none" />

                    {/* Overlay for instructions or status */}
                    {rollsLeft === 3 && !isCPU && !isAnimating && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-bounce">
                                <span className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] italic">¡Lanzá los dados! 🎲</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selection Bar (Chips for locking) */}
                <div className="flex flex-wrap justify-center gap-4 pt-8 pb-4 px-6 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Bloqueo</span>
                    </div>

                    {dice.map((die, i) => (
                        <button
                            key={i}
                            onClick={() => handleToggleLock(i)}
                            disabled={disabled || rollsLeft === 0 || rollsLeft === 3 || isCPU || isAnimating}
                            className={cn(
                                "group relative flex flex-col items-center gap-2 transition-all duration-300",
                                die.locked ? "-translate-y-3 scale-110" : "hover:-translate-y-1"
                            )}
                        >
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all shadow-2xl",
                                die.locked
                                    ? "bg-amber-500 text-black border-2 border-amber-300 shadow-[0_10px_20px_rgba(245,158,11,0.4)]"
                                    : "bg-zinc-800 text-white border border-white/20 hover:border-amber-500/50 shadow-black/50"
                            )}>
                                {die.value}
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.1em] transition-all",
                                die.locked ? "text-amber-500 text-glow-amber opacity-100" : "text-white/20 group-hover:text-white/40"
                            )}>
                                {die.locked ? "Fijo" : "Elegir"}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6 mt-4">
                    <div className="relative group">
                        {/* Pulse glow background for the button */}
                        {!disabled && rollsLeft > 0 && !isCPU && (
                            <div className="absolute -inset-1 bg-amber-500/20 blur-xl rounded-full animate-pulse group-hover:bg-amber-500/40 transition-all" />
                        )}

                        <Button
                            size="lg"
                            variant="primary"
                            onClick={handleRoll}
                            disabled={disabled || rollsLeft === 0 || isCPU || isAnimating}
                            className={cn(
                                "relative px-14 py-8 text-xl font-black shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all active:scale-95 group overflow-hidden tracking-widest",
                                !disabled && rollsLeft > 0 && "hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:-translate-y-1"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Dice6 className={cn(
                                "mr-4 h-8 w-8 transition-all duration-500",
                                isAnimating ? "animate-spin" : "group-hover:rotate-12"
                            )} />
                            <span className="italic uppercase">
                                {rollsLeft === 3 ? "PRIMER TIRO" : rollsLeft === 0 ? "SIN TIROS" : `LANZAR (${rollsLeft})`}
                            </span>
                        </Button>
                    </div>

                    <div className="flex gap-2 p-2 bg-black/20 rounded-full border border-white/5 shadow-inner">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-2 w-10 rounded-full transition-all duration-500",
                                    3 - rollsLeft >= i ? "bg-amber-500 shadow-[0_0_12px_#f59e0b]" : "bg-white/10"
                                )}
                            />
                        ))}
                    </div>

                    {isCPU && (
                        <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                                CPU Pensando...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

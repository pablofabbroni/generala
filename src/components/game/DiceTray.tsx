"use client";

import * as React from "react";
import { Dice } from "./Dice";
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
        playSound("diceRoll");

        // After animation duration, trigger original onRoll
        setTimeout(() => {
            onRoll();
            setIsAnimating(false);
        }, 600);
    };

    const handleToggleLock = (index: number) => {
        if (!disabled && rollsLeft !== 3 && rollsLeft !== 0 && !isCPU) {
            playSound("diceLock");
            onToggleLock(index);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4">
            <div className="flex flex-wrap justify-center gap-4">
                {dice.map((die, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Dice
                            value={die.value}
                            locked={die.locked}
                            onToggleLock={() => handleToggleLock(i)}
                            disabled={disabled || rollsLeft === 0 || rollsLeft === 3 || isCPU || isAnimating}
                            rolling={isAnimating && !die.locked}
                        />
                        {die.locked && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 drop-shadow-sm">
                                Bloqueado
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={handleRoll}
                        disabled={disabled || rollsLeft === 0 || isCPU || isAnimating}
                        className="px-10 py-7 text-lg font-black shadow-2xl transition-all hover:brightness-110 active:scale-95 group"
                    >
                        <Dice6 className={cn(
                            "mr-3 h-7 w-7 transition-all",
                            isAnimating ? "animate-spin" : "group-hover:rotate-12"
                        )} />
                        {rollsLeft === 3 ? "PRIMER TIRO" : rollsLeft === 0 ? "SIN TIROS" : `TIRAR (${rollsLeft})`}
                    </Button>
                </div>

                <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 w-8 rounded-full transition-all duration-500",
                                3 - rollsLeft >= i ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>

                {isCPU && (
                    <p className="animate-pulse text-sm font-medium text-amber-400">
                        CPU está tirando...
                    </p>
                )}
            </div>
        </div>
    );
}

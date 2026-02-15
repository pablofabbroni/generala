"use client";

import { cn } from "@/lib/utils";

interface DiceProps {
    value: number;
    locked: boolean;
    onToggleLock?: () => void;
    disabled?: boolean;
    rolling?: boolean;
}

export function Dice({ value, locked, onToggleLock, disabled, rolling }: DiceProps) {
    return (
        <div className="perspective-1000">
            <div
                onClick={() => !disabled && onToggleLock?.()}
                className={cn(
                    "h-16 w-16 cursor-pointer",
                    locked && "opacity-90 grayscale-[20%]"
                )}
            >
                <div className={cn(
                    "dice-cube",
                    rolling ? "animate-rolling-3d" : `show-${value}`
                )}>
                    {([1, 2, 3, 4, 5, 6] as const).map((face) => (
                        <div key={face} className={cn("dice-face", `face-${face}`, "preserve-3d")}>
                            <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-2 bg-white rounded-xl shadow-inner border border-black/5 relative">
                                <Dots value={face} locked={locked} />
                                {/* Reflection layer per face */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Real Shadow under the cube */}
            <div className={cn(
                "mx-auto mt-2 h-1 w-12 rounded-full bg-black/20 blur-sm transition-all duration-500",
                rolling ? "scale-150 opacity-10" : "scale-100 opacity-30"
            )} />
        </div>
    );
}

function Dots({ value, locked }: { value: number, locked: boolean }) {
    const dotsTemplate = getDotsTemplate(value);
    return (
        <>
            {dotsTemplate.map((dot, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-2 w-2 rounded-full transition-all duration-300",
                        dot ? (locked ? "bg-amber-600 scale-90" : "bg-zinc-900") : "bg-transparent"
                    )}
                />
            ))}
        </>
    );
}

function getDotsTemplate(value: number): boolean[] {
    const template = Array(9).fill(false);
    switch (value) {
        case 1:
            template[4] = true;
            break;
        case 2:
            template[2] = true; template[6] = true;
            break;
        case 3:
            template[2] = true; template[4] = true; template[6] = true;
            break;
        case 4:
            template[0] = true; template[2] = true; template[6] = true; template[8] = true;
            break;
        case 5:
            template[0] = true; template[2] = true; template[4] = true; template[6] = true; template[8] = true;
            break;
        case 6:
            template[0] = true; template[2] = true; template[3] = true; template[5] = true; template[6] = true; template[8] = true;
            break;
    }
    return template;
}

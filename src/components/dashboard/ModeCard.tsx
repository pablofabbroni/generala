"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ModeCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string;
    variant?: "gold" | "green" | "glass";
}

export function ModeCard({
    title,
    description,
    icon: Icon,
    onClick,
    disabled,
    badge,
    variant = "glass"
}: ModeCardProps) {
    const variants = {
        gold: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50",
        green: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/50",
        glass: "from-white/5 to-white/10 border-white/10 hover:border-white/20"
    };

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center text-center gap-4 p-8 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden bg-gradient-to-br",
                variants[variant],
                disabled ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 shadow-2xl"
            )}
        >
            {/* Background Glow */}
            <div className="absolute -inset-24 bg-gradient-to-br from-white/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {badge && (
                <span className="absolute top-4 right-6 px-3 py-1 bg-amber-500 text-[10px] font-black uppercase tracking-widest text-zinc-950 rounded-full shadow-lg">
                    {badge}
                </span>
            )}

            <div className={cn(
                "p-5 rounded-3xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500",
                variant === "gold" && "text-amber-500",
                variant === "green" && "text-emerald-500",
                variant === "glass" && "text-white/80"
            )}>
                <Icon className="h-10 w-10" />
            </div>

            <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:translate-y-[-2px] transition-transform">
                    {title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium transition-colors group-hover:text-white/70">
                    {description}
                </p>
            </div>

            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 group-hover:animate-shine" />
        </button>
    );
}

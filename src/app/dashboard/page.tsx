"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ModeCard } from "@/components/dashboard/ModeCard";
import { Calculator, Dices, Trophy, Users, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export default function DashboardPage() {
    const router = useRouter();
    const setGameMode = useGameStore((s) => s.setGameMode);

    const handleModeSelect = (mode: "digital" | "analog", path: string) => {
        setGameMode(mode);
        router.push(path);
    };

    return (
        <PageContainer className="flex flex-col items-center justify-center min-h-[80vh] gap-12 py-12">
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">
                    Generala <span className="text-amber-500">Casino</span>
                </h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-sm">
                    Elegí tu mesa y empezá a jugar
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                <ModeCard
                    title="Anotador"
                    description="¿Jugás con dados físicos? Usá la app solo para anotar tus puntajes de forma profesional."
                    icon={Calculator}
                    variant="glass"
                    onClick={() => handleModeSelect("analog", "/play/setup")}
                />

                <ModeCard
                    title="Casino Digital"
                    description="Entrá a la mesa digital con dados 3D, sonidos premium y modo solitario vs CPU."
                    icon={Dices}
                    variant="gold"
                    onClick={() => handleModeSelect("digital", "/play/selection")}
                />

                <ModeCard
                    title="Armar Sala"
                    description="Invitá a tus amigos a tu propia mesa privada de casino."
                    icon={Users}
                    disabled
                    badge="Próximamente"
                />

                <ModeCard
                    title="Matchmaking"
                    description="Competí contra jugadores de todo el mundo y subí en el ranking."
                    icon={Globe}
                    disabled
                    badge="Próximamente"
                />
            </div>

            <div className="flex items-center gap-8 pt-8">
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                        <Trophy className="h-5 w-5 text-white/40 group-hover:text-amber-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60">Leaderboard</span>
                </div>
            </div>
        </PageContainer>
    );
}

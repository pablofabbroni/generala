"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ModeCard } from "@/components/dashboard/ModeCard";
import { User, Users, Globe, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";

export default function PlaySelectionPage() {
    const router = useRouter();
    const setGameMode = useGameStore((s) => s.setGameMode);

    const handleSolitario = () => {
        setGameMode("digital");
        router.push("/play/setup");
    };

    return (
        <PageContainer className="flex flex-col items-center justify-center min-h-[80vh] gap-12 py-12">
            <div className="w-full max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="mb-8"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Dashboard
                </Button>
            </div>

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                    Juega <span className="text-amber-500">ahora</span>
                </h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-sm">
                    Elegí la modalidad y disfrutá la experiencia
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
                <ModeCard
                    title="Solitario"
                    description="Enfrentate a la CPU y poné a prueba tu estrategia."
                    icon={User}
                    variant="gold"
                    onClick={handleSolitario}
                />

                <ModeCard
                    title="Armar sala"
                    description="Creá una mesa privada y compartí el código con tus amigos."
                    icon={Users}
                    disabled
                    badge="Próximamente"
                />

                <ModeCard
                    title="Matchmaking"
                    description="Partida rápida contra oponentes aleatorios de tu nivel."
                    icon={Globe}
                    disabled
                    badge="Próximamente"
                />
            </div>
        </PageContainer>
    );
}

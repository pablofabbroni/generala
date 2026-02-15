"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ModeCard } from "@/components/dashboard/ModeCard";
import { User, Users, Globe, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function PlaySelectionPage() {
    const router = useRouter();

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
                    Casino <span className="text-amber-500">Digital</span>
                </h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-sm">
                    Elegí cómo querés jugar hoy
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
                <ModeCard
                    title="Solitario"
                    description="Entrená tus habilidades contra nuestra IA en modo solitario."
                    icon={User}
                    variant="gold"
                    onClick={() => router.push("/play/setup")}
                />

                <ModeCard
                    title="Armar Sala"
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

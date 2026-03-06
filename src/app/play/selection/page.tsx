"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ModeCard } from "@/components/dashboard/ModeCard";
import { User, Globe, ArrowLeft, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PrivateRoomModal from "@/components/game/PrivateRoomModal";
import { ensureInviteCode } from "@/lib/actions/auth";
import RoomBrowser from "@/components/game/RoomBrowser";

export default function PlaySelectionPage() {
    const router = useRouter();
    const setGameMode = useGameStore((s) => s.setGameMode);

    const [profile, setProfile] = useState<any>(null);
    const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
    const [view, setView] = useState<'modes' | 'browser'>('modes');
    const supabase = createClient();

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    if (!data.invite_code) {
                        const newCode = await ensureInviteCode(user.id);
                        setProfile({ ...data, invite_code: newCode });
                    } else {
                        setProfile(data);
                    }
                }
            }
        }
        getProfile();
    }, []);

    const handleSolitario = () => {
        setGameMode("digital");
        router.push("/play/setup");
    };

    return (
        <PageContainer className="flex flex-col items-center justify-center min-h-[80vh] gap-12 py-12">
            <div className="w-full max-w-5xl px-4">
                <Button
                    variant="ghost"
                    onClick={() => view === 'browser' ? setView('modes') : router.push("/dashboard")}
                    className="mb-8"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {view === 'browser' ? 'Volver a Modos' : 'Volver al Dashboard'}
                </Button>
            </div>

            {view === 'modes' ? (
                <>
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
                            description="Enfrentate a la CPU y poné a prueba tu estrategia en un entorno controlado."
                            icon={User}
                            variant="gold"
                            onClick={handleSolitario}
                        />

                        <ModeCard
                            title="Partida Rápida"
                            description="Entrá al lobby, buscá mesas públicas o unite a una privada con código."
                            icon={Play}
                            variant="glass"
                            onClick={() => setView('browser')}
                        />

                        <ModeCard
                            title="Matchmaking"
                            description="Partida rápida contra oponentes aleatorios de tu nivel."
                            icon={Globe}
                            disabled
                            badge="Próximamente"
                        />
                    </div>
                </>
            ) : (
                <RoomBrowser onOpenCreate={() => setIsPrivateModalOpen(true)} />
            )}

            <PrivateRoomModal
                isOpen={isPrivateModalOpen}
                onClose={() => setIsPrivateModalOpen(false)}
                userProfile={profile}
            />
        </PageContainer>
    );
}

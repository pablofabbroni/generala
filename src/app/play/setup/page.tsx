"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PlayersCount } from "@/components/setup/PlayersCount";
import { PlayerCard } from "@/components/setup/PlayerCard";
import { VariantsPanel } from "@/components/setup/VariantsPanel";
import { StartGameButton } from "@/components/setup/StartGameButton";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const variants = useGameStore((s) => s.variants);
  const setPlayersCount = useGameStore((s) => s.setPlayersCount);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const setVariants = useGameStore((s) => s.setVariants);

  const count = players.length;
  const disabled = players.some((p) => !p.name.trim());

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="text-sm text-white/60">Setup de partida</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Jugadores</div>
              <div className="text-xs text-white/60">Máximo 4</div>
            </div>
            <PlayersCount value={count} onChange={setPlayersCount} />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                onChange={(patch) => updatePlayer(p.id, patch)}
              />
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <VariantsPanel value={variants} onChange={setVariants} />
          <StartGameButton disabled={disabled} />
          {disabled ? <div className="text-xs text-rose-300">Completá el nombre de todos los jugadores.</div> : null}
        </div>
      </div>
    </PageContainer>
  );
}

"use client";
import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { ScoreTable } from "@/components/game/ScoreTable";
import { ScoreModal } from "@/components/game/ScoreModal";
import { TotalsBar } from "@/components/game/TotalsBar";
import { getRanking } from "@/lib/scoring";
import { RankingModal } from "@/components/game/RankingModal";
import type { Category } from "@/types/game";

export default function GamePage() {
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const variants = useGameStore((s) => s.variants);
  const scores = useGameStore((s) => s.scores);
  const modal = useGameStore((s) => s.modal);
  const openModal = useGameStore((s) => s.openModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const setScore = useGameStore((s) => s.setScore);
  const clearScore = useGameStore((s) => s.clearScore);
  const isFinished = useGameStore((s) => s.isFinished);
  const resetAll = useGameStore((s) => s.resetAll);

  const [showRanking, setShowRanking] = React.useState(false);

  React.useEffect(() => {
    if (isFinished()) setShowRanking(true);
  }, [scores, isFinished]);

  const selectedPlayer = players.find((p) => p.id === modal?.playerId) ?? null;
  const selectedCategory = (modal?.category ?? null) as Category | null;
  const currentValue = selectedPlayer && selectedCategory ? scores[selectedPlayer.id]?.[selectedCategory] : undefined;

  const ranking = React.useMemo(() => getRanking(players, scores, variants), [players, scores, variants]);

  return (
    <PageContainer className="space-y-6 pb-28">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push("/play/setup")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Setup
        </Button>
        <Button variant="secondary" onClick={() => setShowRanking(true)}>
          <Crown className="mr-2 h-4 w-4" />
          Ver ranking
        </Button>
      </div>

      <ScoreTable
        players={players}
        scores={scores}
        variants={variants}
        onCellClick={(playerId, category) => openModal(playerId, category)}
      />

      <TotalsBar players={players} scores={scores} variants={variants} />

      <ScoreModal
        open={!!modal}
        onOpenChange={(v) => { if (!v) closeModal(); }}
        player={selectedPlayer}
        category={selectedCategory}
        variants={variants}
        currentValue={currentValue}
        onSave={(value) => {
          if (!selectedPlayer || !selectedCategory) return;
          setScore(selectedPlayer.id, selectedCategory, value);
        }}
        onClear={() => {
          if (!selectedPlayer || !selectedCategory) return;
          clearScore(selectedPlayer.id, selectedCategory);
        }}
      />

      <RankingModal
        open={showRanking}
        onOpenChange={setShowRanking}
        ranking={ranking}
        onNewGame={() => {
          resetAll();
          router.push("/play/setup");
        }}
      />
    </PageContainer>
  );
}

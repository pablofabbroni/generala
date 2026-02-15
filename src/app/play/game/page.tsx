"use client";
import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Crown, Settings, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { ScoreTable } from "@/components/game/ScoreTable";
import { TotalsBar } from "@/components/game/TotalsBar";
import { getRanking } from "@/lib/scoring";
import { DiceTray } from "@/components/game/DiceTray";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { GameOverModal } from "@/components/game/GameOverModal";
import { calculatePotentialScores } from "@/lib/game/scoreCalculator";
import { getCPUMove } from "@/lib/game/cpuLogic";
import { useSound } from "@/hooks/useSound";

export default function GamePage() {
  const router = useRouter();
  const {
    phase,
    players,
    variants,
    scores,
    activePlayerId,
    dice,
    rollsLeft,
    startGame,
    rollDice,
    toggleDieLock,
    selectCategory,
    resetAll,
    isMuted,
    toggleMute,
    gameMode
  } = useGameStore();

  const { playSound } = useSound();
  const [isCPUMoving, setIsCPUMoving] = React.useState(false);

  // Initialize game if in setup phase
  React.useEffect(() => {
    if (phase === "setup") {
      startGame();
    }
  }, [phase, startGame]);

  const activePlayer = players.find((p) => p.id === activePlayerId) || players[0];
  const isUserTurn = activePlayer && !activePlayer.isCPU;

  // CPU Logic Loop
  React.useEffect(() => {
    if (gameMode === "analog") return; // No CPU in analog mode for now
    if (phase === "playing" && activePlayer?.isCPU && !isCPUMoving) {
      const runCPUMove = async () => {
        setIsCPUMoving(true);

        // Add a small delay for "thinking" feel
        await new Promise(r => setTimeout(r, 1000));

        const move = getCPUMove(
          dice,
          rollsLeft,
          scores[activePlayer.id] || {},
          activePlayer.difficulty || "easy",
          variants
        );

        if (move.action === "roll") {
          // Note: DiceTray handles rolling sound/animation internally
          rollDice();
        } else if (move.action === "select" && move.category) {
          playSound("scoreSelect");
          selectCategory(move.category);
        }

        setIsCPUMoving(false);
      };

      runCPUMove();
    }
  }, [phase, activePlayerId, rollsLeft, dice, isCPUMoving, activePlayer, scores, variants, rollDice, selectCategory, playSound, gameMode]);

  const potentialScores = React.useMemo(() => calculatePotentialScores(dice), [dice]);
  const ranking = React.useMemo(() => getRanking(players, scores, variants), [players, scores, variants]);
  const formattedRanking = React.useMemo(() => ranking.map(r => ({
    playerId: r.id,
    name: r.name,
    color: r.color,
    total: r.total
  })), [ranking]);

  if (phase === "setup") return null;

  return (
    <PageContainer className="space-y-6 pb-28">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Salir
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleMute()}
            className={isMuted ? "text-white/40" : "text-amber-500"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="secondary" onClick={() => resetAll()}>
            <Settings className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <TurnIndicator activePlayer={activePlayer} isCPU={isCPUMoving} />

          {gameMode === "digital" && (
            <div className="rounded-3xl bg-white/5 border border-white/10 p-4 shadow-2xl">
              <DiceTray
                dice={dice}
                rollsLeft={rollsLeft}
                onRoll={rollDice}
                onToggleLock={toggleDieLock}
                disabled={!isUserTurn || isCPUMoving}
                isCPU={isCPUMoving}
              />
            </div>
          )}

          <div className="hidden lg:block">
            <TotalsBar players={players} scores={scores} variants={variants} />
          </div>
        </div>

        <div className="lg:col-span-8">
          <ScoreTable
            players={players}
            scores={scores}
            variants={variants}
            activePlayerId={activePlayerId}
            potentialScores={isUserTurn && rollsLeft < 3 && gameMode === "digital" ? potentialScores : {}}
            onCellClick={(pid, cat) => {
              const canSelect = pid === activePlayerId && isUserTurn && (gameMode === "analog" || rollsLeft < 3);
              if (canSelect) {
                playSound("scoreSelect");
                selectCategory(cat);
              }
            }}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <TotalsBar players={players} scores={scores} variants={variants} />
      </div>

      <GameOverModal
        open={phase === "gameOver"}
        onOpenChange={(open) => { if (!open) resetAll(); }}
        ranking={formattedRanking}
        onNewGame={() => {
          resetAll();
          startGame();
        }}
        onGoHome={() => {
          resetAll();
          router.push("/");
        }}
      />
    </PageContainer>
  );
}

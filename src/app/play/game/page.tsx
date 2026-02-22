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
import { Modal } from "@/components/ui/Modal";
import { ScoreModal } from "@/components/game/ScoreModal";
import { calculatePotentialScores } from "@/lib/game/scoreCalculator";
import { getCPUMove } from "@/lib/game/cpuLogic";
import { useSound } from "@/hooks/useSound";
import type { Category } from "@/types/game";
import { TableFelt } from "@/components/game/TableFelt";
import { cn } from "@/lib/utils";
import { CPUScoreNotification } from "@/components/game/CPUScoreNotification";

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
    gameMode,
    openModal,
    closeModal,
    modal,
    setScore,
    clearScore
  } = useGameStore();

  const { playSound } = useSound();
  const [isCPUMoving, setIsCPUMoving] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  // CPU score notification state
  const [cpuNotification, setCpuNotification] = React.useState<{
    playerName: string;
    category: string;
    score: number;
    visible: boolean;
  } | null>(null);

  // Ref to scroll to top/game area when CPU starts playing
  const gameTopRef = React.useRef<HTMLDivElement>(null);

  // Initialize game if in setup phase
  React.useEffect(() => {
    if (phase === "setup") {
      startGame();
    }
  }, [phase, startGame]);

  const activePlayer = players.find((p) => p.id === activePlayerId) || players[0];
  const isUserTurn = activePlayer && !activePlayer.isCPU;

  // Auto-scroll to the top of the game area when CPU starts its turn
  React.useEffect(() => {
    if (gameMode !== "digital") return;
    if (activePlayer?.isCPU && !isCPUMoving) {
      // Small delay to let the transition happen, then scroll up so user sees the dice
      setTimeout(() => {
        gameTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [activePlayerId, gameMode]); // eslint-disable-line

  const [countdown, setCountdown] = React.useState<number | null>(null);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Start / restart the 10-second auto-roll countdown (only for human turns with rolls remaining)
  const startCountdown = React.useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(10);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopCountdown = React.useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
  }, []);

  // CPU Logic Loop
  React.useEffect(() => {
    if (gameMode === "analog") return;
    if (phase === "playing" && activePlayer?.isCPU && !isCPUMoving) {
      stopCountdown(); // no countdown during CPU turn
      const runCPUMove = async () => {
        setIsCPUMoving(true);

        // Wait 1.8s so dice visually settle before CPU acts
        await new Promise(r => setTimeout(r, 1800));

        const move = getCPUMove(
          dice,
          rollsLeft,
          scores[activePlayer.id] || {},
          activePlayer.difficulty || "easy",
          variants
        );

        if (move.action === "roll") {
          // Apply CPU lock choices BEFORE rolling
          if (move.lockIndices && move.lockIndices.length > 0) {
            for (const idx of move.lockIndices) {
              toggleDieLock(idx);
            }
            // Brief pause so lock animation is visible
            await new Promise(r => setTimeout(r, 500));
          }
          rollDice();
        } else if (move.action === "select" && move.category) {
          const potScores = calculatePotentialScores(dice);
          const scoreValue = potScores[move.category] ?? 0;

          playSound("scoreSelect");
          selectCategory(move.category);

          setCpuNotification({
            playerName: activePlayer.name,
            category: move.category,
            score: scoreValue,
            visible: true,
          });

          setTimeout(() => {
            setCpuNotification(prev => prev ? { ...prev, visible: false } : null);
          }, 2500);
        }

        setIsCPUMoving(false);
      };

      runCPUMove();
    }
  }, [phase, activePlayerId, rollsLeft, dice, isCPUMoving, activePlayer, scores, variants, rollDice, selectCategory, toggleDieLock, playSound, gameMode, stopCountdown]); // Added toggleDieLock and stopCountdown

  // Countdown logic for human player
  React.useEffect(() => {
    if (phase === "playing" && isUserTurn && rollsLeft > 0 && !modal) {
      startCountdown();
    } else {
      stopCountdown();
    }
  }, [phase, isUserTurn, rollsLeft, modal, startCountdown, stopCountdown]);

  // Handle auto-roll when countdown hits 0
  React.useEffect(() => {
    if (countdown === 0) {
      rollDice();
      startCountdown(); // Restart after auto-roll
    }
  }, [countdown, rollDice, startCountdown]);

  const potentialScores = React.useMemo(() => calculatePotentialScores(dice), [dice]);
  const ranking = React.useMemo(() => getRanking(players, scores, variants), [players, scores, variants]);
  const formattedRanking = React.useMemo(() => ranking.map(r => ({
    playerId: r.id,
    name: r.name,
    color: r.color,
    total: r.total
  })), [ranking]);

  const selectedPlayer = players.find((p) => p.id === modal?.playerId) ?? null;
  const selectedCategory = (modal?.category ?? null) as Category | null;
  const currentValue = selectedPlayer && selectedCategory ? scores[selectedPlayer.id]?.[selectedCategory] : undefined;

  if (phase === "setup") return null;

  return (
    <TableFelt>
      {/* CPU Score Notification */}
      {cpuNotification && (
        <CPUScoreNotification
          playerName={cpuNotification.playerName}
          category={cpuNotification.category}
          score={cpuNotification.score}
          visible={cpuNotification.visible}
        />
      )}

      {/* Countdown Timer Visual */}
      {countdown !== null && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
          <div className="text-amber-500 font-black text-4xl animate-pulse [text-shadow:0_0_20px_rgba(245,158,11,0.5)]">
            {countdown}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
            Auto-lanzamiento
          </div>
        </div>
      )}

      {/* Mobile Orientation Warning */}
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 p-6 text-center landscape:hidden sm:hidden">
        <div className="mb-6 rounded-full bg-amber-500/20 p-6 animate-pulse">
          <svg className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-white uppercase italic">Girá tu dispositivo</h2>
        <p className="mt-2 text-sm text-white/60">Para disfrutar la mejor experiencia de casino, jugá en modo horizontal.</p>
      </div>

      <PageContainer className="space-y-6 pb-28 max-w-[1600px] mx-auto">
        {/* Scroll anchor for auto-scroll on CPU turn */}
        <div ref={gameTopRef} />

        <div className="flex items-center justify-between gap-3 relative z-20">
          <Button variant="ghost" onClick={() => setShowExitConfirm(true)} className="bg-white/5 hover:bg-white/10 border border-white/5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleMute()}
              className={cn("border border-white/5", isMuted ? "text-white/40" : "text-amber-500")}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" onClick={() => resetAll()} className="border border-white/5">
              <Settings className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-1 gap-8 items-start",
          gameMode === "digital" ? "lg:grid-cols-12" : "max-w-4xl mx-auto w-full"
        )}>
          {/* Main Content: Table area (Only in Digital) */}
          {gameMode === "digital" && (
            <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
              <div className="relative group">
                {/* Spotlight/Glow behind the table area */}
                <div className="absolute -inset-4 bg-amber-500/5 blur-3xl rounded-full opacity-50 pointer-events-none" />
                <DiceTray
                  dice={dice}
                  rollsLeft={rollsLeft}
                  onRoll={rollDice}
                  onToggleLock={toggleDieLock}
                  disabled={!isUserTurn || isCPUMoving}
                  isCPU={isCPUMoving}
                />
              </div>

              <div className="lg:hidden">
                <TurnIndicator activePlayer={activePlayer} isCPU={isCPUMoving} />
              </div>
            </div>
          )}

          {/* Sidebar: Scores and Info */}
          <div className={cn(
            "space-y-6",
            gameMode === "digital" ? "lg:col-span-4 order-1 lg:order-2" : "w-full"
          )}>
            <div className={cn(gameMode === "digital" ? "hidden lg:block" : "block")}>
              <TurnIndicator activePlayer={activePlayer} isCPU={isCPUMoving} />
            </div>

            <div className="rounded-3xl bg-zinc-950/40 border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl">
              <ScoreTable
                players={players}
                scores={scores}
                variants={variants}
                activePlayerId={activePlayerId}
                potentialScores={isUserTurn && rollsLeft < 3 && gameMode === "digital" ? potentialScores : {}}
                onCellClick={(pid, cat) => {
                  if (gameMode === "analog") {
                    openModal(pid, cat);
                    return;
                  }
                  const canSelect = pid === activePlayerId && isUserTurn && rollsLeft < 3;
                  if (canSelect) {
                    playSound("scoreSelect");
                    selectCategory(cat);
                  }
                }}
              />
            </div>

            <TotalsBar players={players} scores={scores} variants={variants} />
          </div>
        </div>

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

        <Modal
          open={showExitConfirm}
          onOpenChange={setShowExitConfirm}
          title="¿Salir de la partida?"
        >
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              Si salís ahora perderás todo el progreso de la partida actual. ¿Estás seguro?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowExitConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-500 hover:bg-red-600 border-red-500/50"
                onClick={() => {
                  resetAll();
                  router.push("/dashboard");
                }}
              >
                Salir
              </Button>
            </div>
          </div>
        </Modal>
      </PageContainer>
    </TableFelt>
  );
}

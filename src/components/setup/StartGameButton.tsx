"use client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { Play } from "lucide-react";

export function StartGameButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const startGame = useGameStore(s => s.startGame);

  return (
    <Button
      size="lg"
      variant="primary"
      className="w-full h-14 text-lg font-black tracking-widest uppercase shadow-2xl shadow-amber-500/20"
      disabled={disabled}
      onClick={() => {
        startGame();
        router.push("/play/game");
      }}
    >
      <Play className="mr-2 h-5 w-5 fill-current" />
      Jugar Ahora
    </Button>
  );
}

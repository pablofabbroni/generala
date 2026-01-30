"use client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function StartGameButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  return (
    <Button
      size="lg"
      className="w-full"
      disabled={disabled}
      onClick={() => router.push("/play/game")}
    >
      Iniciar partida
    </Button>
  );
}

import { DiceState } from "@/types/game";

export function rollDice(currentDice: DiceState[]): DiceState[] {
    return currentDice.map(d =>
        d.locked
            ? d  // Keep locked dice exactly as-is (value + rollKey unchanged)
            : { ...d, value: Math.floor(Math.random() * 6) + 1, rollKey: (d.rollKey ?? 0) + 1 }
    );
}

export function createInitialDice(): DiceState[] {
    return Array(5).fill(null).map(() => ({ value: 1, locked: false, rollKey: 0 }));
}

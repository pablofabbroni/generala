import { Category, DiceState, Player } from "@/types/game";
import { calculatePotentialScores } from "./scoreCalculator";
import { getCategories } from "../categories";

export function getCPUMove(
    dice: DiceState[],
    rollsLeft: number,
    scorecard: Partial<Record<Category, number>>,
    difficulty: "easy" | "medium" | "hard" = "easy",
    variants: any
): { action: "roll" | "select"; category?: Category; lockIndices?: number[] } {
    const potentialScores = calculatePotentialScores(dice);
    const availableCategories = getCategories(variants).filter(
        (cat) => scorecard[cat] === undefined
    );

    if (availableCategories.length === 0) return { action: "select", category: undefined };

    // Simple logic for Easy/Medium
    if (rollsLeft > 0) {
        // Should we roll again?
        // In Easy: always roll 3 times if no "big" game
        // In Medium: keep some dice
        const hasBigGame = (potentialScores.generala || 0) > 0 || (potentialScores.poker || 0) > 0 || (potentialScores.full || 0) > 0;

        if (hasBigGame && rollsLeft < 3) {
            // If we have a big game, select it
            const bestCat = findBestCategory(potentialScores, availableCategories);
            return { action: "select", category: bestCat };
        }

        // Otherwise roll again
        // Logic for locking: lock dice that appear most frequently
        const lockIndices = getLockIndices(dice, difficulty);
        return { action: "roll", lockIndices };
    }

    // No rolls left, must select
    const bestCat = findBestCategory(potentialScores, availableCategories);
    return { action: "select", category: bestCat };
}

function findBestCategory(
    potential: Partial<Record<Category, number>>,
    available: Category[]
): Category {
    let bestCat = available[0];
    let maxScore = -1;

    for (const cat of available) {
        const score = potential[cat] || 0;
        if (score > maxScore) {
            maxScore = score;
            bestCat = cat;
        }
    }
    return bestCat;
}

function getLockIndices(dice: DiceState[], difficulty: string): number[] {
    if (difficulty === "easy") return []; // Easy doesn't lock for simplicity or locks randomly

    // Medium: lock numbers that are already paired
    const values = dice.map(d => d.value);
    const counts = values.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const maxVal = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    const target = parseInt(maxVal);

    return dice.map((d, i) => d.value === target ? i : -1).filter(i => i !== -1);
}

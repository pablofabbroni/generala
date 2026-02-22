import { Category, DiceState } from "@/types/game";
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

    // If no rolls remain — must select
    if (rollsLeft <= 0) {
        const bestCat = findBestCategory(potentialScores, availableCategories);
        return { action: "select", category: bestCat };
    }

    // MANDATORY FIRST ROLL: If rollsLeft is 3, we must roll (prevent scoring initial 1s state)
    if (rollsLeft === 3) {
        return { action: "roll", lockIndices: [] };
    }

    // Check if we already have a great hand worth keeping
    const hasGenerala = (potentialScores.generala ?? 0) > 0;
    const hasPoker = (potentialScores.poker ?? 0) > 0;
    const hasFull = (potentialScores.full ?? 0) > 0;
    const hasStraight = (potentialScores.majorStraight ?? 0) > 0 || (potentialScores.minorStraight ?? 0) > 0;

    if (hasGenerala || hasPoker || hasFull || hasStraight) {
        // Already have a big hand — score it immediately
        const bestCat = findBestCategory(potentialScores, availableCategories);
        return { action: "select", category: bestCat };
    }

    // Decide what to lock for the next roll
    const lockIndices = getSmartLockIndices(dice, potentialScores, rollsLeft, scorecard);

    // If we have nothing worth keeping and it's the last roll, just score
    if (rollsLeft === 1 && lockIndices.length === 0) {
        const bestCat = findBestCategory(potentialScores, availableCategories);
        return { action: "select", category: bestCat };
    }

    return { action: "roll", lockIndices };
}

function getSmartLockIndices(
    dice: DiceState[],
    potentialScores: Partial<Record<Category, number>>,
    rollsLeft: number,
    scorecard: Partial<Record<Category, number>>
): number[] {
    const values = dice.map(d => d.value);

    // Count each face value frequency
    const counts: Record<number, number> = {};
    for (const v of values) counts[v] = (counts[v] || 0) + 1;

    // Find the most frequent value
    let bestValue = -1;
    let bestCount = 0;
    for (const [v, c] of Object.entries(counts)) {
        if (c > bestCount) {
            bestCount = c;
            bestValue = parseInt(v);
        }
    }

    // Always keep pairs, triples, quads — these lead to Poker, Full, or Generala
    if (bestCount >= 2) {
        return dice
            .map((d, i) => (d.value === bestValue ? i : -1))
            .filter(i => i !== -1);
    }

    // Check for straight potential: keep values that are part of longest consecutive run
    const distinct = Array.from(new Set(values)).sort((a, b) => a - b);
    const straightSets = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
    let bestStraightIndices: number[] = [];
    for (const set of straightSets) {
        const match = distinct.filter(v => set.includes(v));
        if (match.length > bestStraightIndices.length) {
            // Keep unique dice that match this straight set
            const seen = new Set<number>();
            const indices: number[] = [];
            for (let i = 0; i < dice.length; i++) {
                if (set.includes(dice[i].value) && !seen.has(dice[i].value)) {
                    seen.add(dice[i].value);
                    indices.push(i);
                }
            }
            if (indices.length >= 3) bestStraightIndices = indices;
        }
    }
    if (bestStraightIndices.length >= 3) return bestStraightIndices;

    // If we have all different values with no pattern, keep the highest value die
    if (rollsLeft === 1) {
        // On last roll, keep any die with highest count (even if just 1)
        return dice
            .map((d, i) => (d.value === bestValue ? i : -1))
            .filter(i => i !== -1)
            .slice(0, 1);
    }

    // Still 2+ rolls left and all different — roll everything (no good hand forming)
    return [];
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

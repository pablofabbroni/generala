import { Category, DiceState } from "@/types/game";

export function calculatePotentialScores(dice: DiceState[]): Partial<Record<Category, number>> {
    const values = dice.map(d => d.value).sort((a, b) => a - b);
    const counts = values.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const scores: Partial<Record<Category, number>> = {};

    // Upper section
    scores.ones = (counts[1] || 0) * 1;
    scores.twos = (counts[2] || 0) * 2;
    scores.threes = (counts[3] || 0) * 3;
    scores.fours = (counts[4] || 0) * 4;
    scores.fives = (counts[5] || 0) * 5;
    scores.sixes = (counts[6] || 0) * 6;

    // Lower section logic
    const uniqueValues = Array.from(new Set(values));
    const uniqueStr = uniqueValues.join("");

    // Straights
    // Minor: 1-2-3-4-5 or 2-3-4-5-6 or 1-2-3-4-6? (Generala rules vary, but usually 5 consecutive)
    // Major: 1-2-3-4-5 or 2-3-4-5-6
    const isMajorStraight = uniqueStr === "12345" || uniqueStr === "23456" || uniqueStr === "13456"; // 13456 is common variant for 1-3-4-5-6

    // Custom check for 5 consecutive
    function hasConsecutive(arr: number[], length: number) {
        if (arr.length < length) return false;
        let count = 1;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i + 1] === arr[i] + 1) {
                count++;
                if (count >= length) return true;
            } else {
                count = 1;
            }
        }
        return false;
    }

    const isStraight = isMajorStraight || hasConsecutive(uniqueValues, 5);

    scores.majorStraight = isStraight ? 25 : 0;
    scores.minorStraight = hasConsecutive(uniqueValues, 4) ? 20 : 0;

    // Full, Poker, Generala
    const countsList = Object.values(counts).sort((a, b) => b - a);

    if (countsList[0] === 5) {
        scores.generala = 50;
        scores.doubleGenerala = 100;
        scores.poker = 40;
        scores.full = 30;
    } else if (countsList[0] === 4) {
        scores.poker = 40;
        scores.full = 0;
    } else if (countsList[0] === 3 && countsList[1] === 2) {
        scores.full = 30;
    }

    // Chance
    scores.chance = values.reduce((a, b) => a + b, 0);

    return scores;
}

export function isServido(rollsLeft: number): boolean {
    return rollsLeft === 2; // If it's the first roll, rollsLeft was 3, now it's 2.
}

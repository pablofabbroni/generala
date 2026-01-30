import type { Category, Variants } from "@/types/game";

export const categoryMeta: Record<Category, { label: string }> = {
  ones: { label: "1" },
  twos: { label: "2" },
  threes: { label: "3" },
  fours: { label: "4" },
  fives: { label: "5" },
  sixes: { label: "6" },

  minorStraight: { label: "Escalera menor" },
  majorStraight: { label: "Escalera mayor" },
  full: { label: "Full" },
  poker: { label: "Poker" },
  generala: { label: "Generala" },
  doubleGenerala: { label: "Generala doble" },
};

const baseCategories: Category[] = [
  "ones","twos","threes","fours","fives","sixes",
  "majorStraight","full","poker","generala",
];

export function getCategories(v: Variants): Category[] {
  const cats: Category[] = [...baseCategories];

  if (v.minorStraight) {
    const idx = cats.indexOf("majorStraight");
    cats.splice(Math.max(idx, 0), 0, "minorStraight");
  }

  if (v.doubleGenerala) {
    const idx = cats.indexOf("generala");
    cats.splice(Math.max(idx + 1, 0), 0, "doubleGenerala");
  }

  return cats;
}

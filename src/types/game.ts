export type Variants = {
  minorStraight: boolean;
  doubleGenerala: boolean; // agrega fila "Generala doble"
  upperBonus63: boolean;
};

export type Player = {
  id: string;
  name: string;
  color: string; // hex
};

export type Category =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "minorStraight"
  | "majorStraight" | "full" | "poker" | "generala" | "doubleGenerala";

export type ScoresByPlayer = Record<string, Partial<Record<Category, number>>>;

export type GameState = {
  variants: Variants;
  players: Player[];
  scores: ScoresByPlayer;
};

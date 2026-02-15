export type DiceState = {
  value: number;
  locked: boolean;
};

export type GamePhase = "setup" | "playing" | "gameOver";
export type GameMode = "digital" | "analog";

export type Variants = {
  minorStraight: boolean;
  doubleGenerala: boolean; // agrega fila "Generala doble"
  upperBonus63: boolean;
};

export type Player = {
  id: string;
  name: string;
  color: string; // hex
  isCPU?: boolean;
  difficulty?: "easy" | "medium" | "hard";
};

export type Category =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "minorStraight"
  | "majorStraight" | "full" | "poker" | "generala" | "doubleGenerala"
  | "chance";

export type ScoresByPlayer = Record<string, Partial<Record<Category, number>>>;

export type GameState = {
  phase: GamePhase;
  gameMode: GameMode;
  variants: Variants;
  players: Player[];
  scores: ScoresByPlayer;
  activePlayerId: string;
  dice: DiceState[];
  rollsLeft: number;
  winnerId: string | null;
};

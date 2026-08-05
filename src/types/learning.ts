export type PuzzleTheme =
  | "mate_in_1"
  | "mate_in_2"
  | "mate_in_3"
  | "fork"
  | "pin"
  | "skewer"
  | "discovered_attack"
  | "double_attack"
  | "deflection"
  | "decoy"
  | "smothered_mate"
  | "back_rank"
  | "promotion"
  | "endgame"
  | "opening_trap"
  | "tactic";

export interface PuzzleRecord {
  id: string;
  fen: string;
  moves: string[]; // UCI sequence e.g. ["e2e4", "e7e5"]
  rating: number;
  theme: PuzzleTheme;
  description?: string;
}

export interface LessonRecord {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced" | "grandmaster";
  category: string;
  description: string;
  fen: string;
  solutionMoves: string[];
  explanation: string;
  xpReward: number;
  orderNum: number;
}

export interface UserProgressRecord {
  userId: string;
  level: number;
  totalXp: number;
  puzzleRating: number;
  dailyStreak: number;
  puzzlesSolved: number;
  lessonsCompleted: number;
}

export interface MissionRecord {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  missionType: "daily" | "weekly" | "monthly";
  completed: boolean;
}

export interface AchievementRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface OpeningInfoExtended {
  id: string;
  eco: string;
  name: string;
  pgnMoves: string;
  winRateWhite: number;
  winRateBlack: number;
  drawRate: number;
  popularContinuations: string[];
}

export interface EndgameLessonRecord {
  id: string;
  title: string;
  category: "king_queen" | "king_rook" | "king_pawn" | "lucena" | "philidor" | "basic_mates";
  fen: string;
  goalInstructions: string;
}

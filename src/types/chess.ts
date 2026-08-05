export type GameMode = "vs_ai" | "online" | "pass_and_play" | "puzzle" | "analysis" | "learn" | "ai_vs_ai" | "tournaments" | "admin";

export type PieceTheme = "neo_staunton" | "royal_gold" | "minimalist";

export type BoardTheme = "gold" | "emerald" | "marble" | "cyber";

export type AiDifficulty = "beginner" | "easy" | "medium" | "hard" | "expert" | "grandmaster";

export type MoveClassification = "brilliant" | "great" | "best" | "excellent" | "good" | "inaccuracy" | "mistake" | "blunder";

export interface OpeningInfo {
  eco: string;
  name: string;
}

export interface StockfishLevelConfig {
  level: number; // 1 - 20
  elo: number; // e.g., 800 - 3200
  depth: number;
  blunderRate: number;
  thinkingTimeMs: number;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string; // GM, IM, FM, WGM, NM, Contender
  rating: {
    rapid: number;
    blitz: number;
    bullet: number;
    puzzle: number;
  };
  country: string;
  avatar: string;
  winCount: number;
  lossCount: number;
  drawCount: number;
  dailyStreak: number;
}

export interface TimeControl {
  name: string;
  initial: number; // seconds
  increment: number; // seconds
  delay?: number; // seconds
  category: "bullet" | "blitz" | "rapid" | "classical" | "untimed";
}

export interface ChessMoveRecord {
  from: string;
  to: string;
  piece: string;
  san: string;
  captured?: string;
  promotion?: string;
  fen: string;
  uci?: string;
  evalBefore?: number;
  evalAfter?: number;
  classification?: MoveClassification;
  timeSpentMs?: number;
}

export interface DbGameRecord {
  id: string;
  white_player_id?: string;
  black_player_id?: string;
  fen: string;
  pgn: string;
  status: "in_progress" | "completed" | "draw" | "abandoned";
  winner_id?: string;
  win_reason?: "checkmate" | "timeout" | "resignation" | "stalemate" | "agreement" | "insufficient_material" | "threefold" | "fifty_move" | "abandonment";
  time_control: string;
  game_type: "pvp" | "ai" | "analysis" | "local";
  ai_level?: number;
  white_time_ms: number;
  black_time_ms: number;
  turn: "w" | "b";
  created_at: string;
  updated_at: string;
  ended_at?: string;
}

export interface SavedGameRecord {
  id: string;
  user_id: string;
  title: string;
  fen: string;
  pgn: string;
  time_control: string;
  mode: string;
  created_at: string;
  updated_at: string;
}

export interface GameSettings {
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  soundEnabled: boolean;
  highlightLegalMoves: boolean;
  showEvalBar: boolean;
  autoFlipBoard: boolean;
  coachEnabled: boolean;
  moveAnimationSpeed: "fast" | "normal" | "instant";
}

export interface DailyPuzzle {
  id: string;
  title: string;
  description: string;
  fen: string;
  rating: number;
  solution: string[];
  solutionSan?: string[];
  theme: string;
  turn: "w" | "b";
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  rating: number;
  title: string;
  flag: string;
  winRate: string;
  country: string;
  avatar: string;
  streak?: string | number;
}

export interface PostGameAnalysisData {
  accuracyScore: number;
  keyInsight: string;
  blunders: number;
  mistakes: number;
  bestMoves: number;
  commentary: string;
}

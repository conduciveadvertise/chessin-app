import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { PuzzleRecord, LessonRecord, UserProgressRecord, MissionRecord, AchievementRecord, OpeningInfoExtended, EndgameLessonRecord } from "../types/learning";

export class LearningRepository {
  /**
   * Fetch daily puzzle or fallback
   */
  async getDailyPuzzle(): Promise<PuzzleRecord> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("daily_puzzles")
          .select("*, puzzles(*)")
          .eq("puzzle_date", new Date().toISOString().split("T")[0])
          .single();

        if (data && data.puzzles) {
          return {
            id: data.puzzles.id,
            fen: data.puzzles.fen,
            moves: data.puzzles.moves,
            rating: data.puzzles.rating,
            theme: data.puzzles.theme,
            description: data.title,
          };
        }
      } catch (err) {
        console.log("Daily puzzle fetch fallback to local default");
      }
    }

    // Default built-in daily puzzle
    return {
      id: "daily-default-01",
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
      moves: ["h5f7"], // Scholar's Mate
      rating: 1200,
      theme: "mate_in_1",
      description: "Scholar's Mate tactic on f7 square",
    };
  }

  /**
   * Fetch puzzle collection by theme or rating
   */
  async getPuzzlesByTheme(theme: string): Promise<PuzzleRecord[]> {
    const defaultPuzzles: PuzzleRecord[] = [
      {
        id: "p1",
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5",
        moves: ["c4f7", "e8f7"],
        rating: 1350,
        theme: "fork",
        description: "Bishop sacrifice creating King disruption",
      },
      {
        id: "p2",
        fen: "6k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1",
        moves: ["b2b8"],
        rating: 1100,
        theme: "back_rank",
        description: "Classic Back Rank Checkmate",
      },
      {
        id: "p3",
        fen: "r1b2rk1/pp1p1ppp/2n5/4p3/2B1P3/2q2N2/P1P2PPP/R2Q1RK1 w - - 0 11",
        moves: ["c4f7"],
        rating: 1500,
        theme: "deflection",
        description: "Deflect defender from Queen defense",
      },
      {
        id: "p4",
        fen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/3P1N2/PPP2PPP/RNBQKB1R b KQkq - 1 3",
        moves: ["d5e4"],
        rating: 1250,
        theme: "tactic",
        description: "Center pawn liquidation tactic",
      },
    ];

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from("puzzles").select("*").eq("theme", theme).limit(10);
        if (data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            fen: d.fen,
            moves: d.moves,
            rating: d.rating,
            theme: d.theme,
            description: d.description,
          }));
        }
      } catch (err) {
        console.log("DB puzzles error fallback");
      }
    }

    return defaultPuzzles;
  }

  /**
   * Fetch Academy interactive lessons
   */
  async getLessons(level?: string): Promise<LessonRecord[]> {
    const defaultLessons: LessonRecord[] = [
      {
        id: "l1",
        title: "Controlling the Center",
        level: "beginner",
        category: "Opening Principles",
        description: "Occupy and control d4, d5, e4, e5 squares early in the game.",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        solutionMoves: ["e2e4"],
        explanation: "e4 stakes immediate claim on central territory while freeing lines for Bishop and Queen.",
        xpReward: 100,
        orderNum: 1,
      },
      {
        id: "l2",
        title: "King Safety & Castling",
        level: "beginner",
        category: "King Safety",
        description: "Secure your King into a safe fortress while activating your Rook.",
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        solutionMoves: ["e1g1"],
        explanation: "Kingside castling puts the King behind a pawn wall and connects Rooks.",
        xpReward: 100,
        orderNum: 2,
      },
      {
        id: "l3",
        title: "Knight Forks",
        level: "intermediate",
        category: "Tactics",
        description: "Use the L-shaped jump to attack two valuable pieces simultaneously.",
        fen: "r1bqk2r/pppp1ppp/8/4n3/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
        solutionMoves: ["c3d5"],
        explanation: "The Knight jumps to d5 threatening multi-square forks.",
        xpReward: 150,
        orderNum: 3,
      },
      {
        id: "l4",
        title: "Lucena Position Endgame",
        level: "advanced",
        category: "Endgame",
        description: "Master the bridge technique to convert Rook & Pawn endgames.",
        fen: "1K6/3P1k2/8/8/8/8/r7/8 w - - 0 1",
        solutionMoves: ["b8c7"],
        explanation: "Step the King out of the promotion square to pave the way.",
        xpReward: 250,
        orderNum: 4,
      },
    ];

    return defaultLessons;
  }

  /**
   * Fetch missions list
   */
  async getMissions(): Promise<MissionRecord[]> {
    return [
      {
        id: "m1",
        title: "Solve 3 Puzzles",
        description: "Complete 3 tactical puzzles today",
        targetCount: 3,
        currentCount: 1,
        xpReward: 100,
        missionType: "daily",
        completed: false,
      },
      {
        id: "m2",
        title: "Win 1 Rated Game",
        description: "Win a rapid or blitz game",
        targetCount: 1,
        currentCount: 1,
        xpReward: 150,
        missionType: "daily",
        completed: true,
      },
      {
        id: "m3",
        title: "Complete 2 Lessons",
        description: "Finish 2 interactive academy modules",
        targetCount: 2,
        currentCount: 0,
        xpReward: 200,
        missionType: "weekly",
        completed: false,
      },
    ];
  }

  /**
   * Fetch achievements cabinet
   */
  async getAchievements(): Promise<AchievementRecord[]> {
    return [
      {
        id: "a1",
        code: "FIRST_WIN",
        title: "First Checkmate",
        description: "Win your first chess game on CHESS.IN",
        badgeIcon: "trophy",
        xpReward: 100,
        unlocked: true,
        unlockedAt: "2026-08-01",
      },
      {
        id: "a2",
        code: "PUZZLE_MASTER",
        title: "Tactics Master",
        description: "Reach a 1800+ puzzle rating",
        badgeIcon: "target",
        xpReward: 300,
        unlocked: false,
      },
      {
        id: "a3",
        code: "STREAK_7",
        title: "Weekly Dedication",
        description: "Maintain a 7-day daily puzzle streak",
        badgeIcon: "flame",
        xpReward: 500,
        unlocked: true,
        unlockedAt: "2026-08-04",
      },
      {
        id: "a4",
        code: "GRANDMASTER_LESSON",
        title: "Scholar",
        description: "Complete all Grandmaster academy modules",
        badgeIcon: "award",
        xpReward: 1000,
        unlocked: false,
      },
    ];
  }

  /**
   * Fetch opening database entries
   */
  async getOpeningExplorer(): Promise<OpeningInfoExtended[]> {
    return [
      {
        id: "o1",
        eco: "C50",
        name: "Italian Game",
        pgnMoves: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
        winRateWhite: 48.0,
        winRateBlack: 38.0,
        drawRate: 14.0,
        popularContinuations: ["Bc5 (Giuoco Piano)", "Nf6 (Two Knights)", "Be7 (Hungarian)"],
      },
      {
        id: "o2",
        eco: "B90",
        name: "Sicilian Najdorf",
        pgnMoves: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6",
        winRateWhite: 44.0,
        winRateBlack: 42.0,
        drawRate: 14.0,
        popularContinuations: ["Be3 (English Attack)", "Bg5 (Classical)", "h3 (Adams Attack)"],
      },
      {
        id: "o3",
        eco: "D02",
        name: "London System",
        pgnMoves: "1. d4 d5 2. Nf3 Nf6 3. Bf4",
        winRateWhite: 50.0,
        winRateBlack: 36.0,
        drawRate: 14.0,
        popularContinuations: ["c5", "e6", "Bf5"],
      },
    ];
  }
}

export const learningRepository = new LearningRepository();

import { Chess, Square } from "chess.js";
import { StockfishLevelConfig, MoveClassification, OpeningInfo } from "../types/chess";
import { detectOpening } from "./openingBook";

// Piece Values in Centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// PST tables for positional evaluation
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

export class StockfishEngine {
  /**
   * Generates configuration specs for Stockfish levels 1 through 20
   */
  static getLevelConfig(level: number): StockfishLevelConfig {
    const clampedLevel = Math.max(1, Math.min(20, level));
    const elo = 800 + (clampedLevel - 1) * 125; // 800 to 3175 ELO
    const depth = Math.min(6, Math.max(1, Math.floor(clampedLevel / 3)));
    const blunderRate = Math.max(0, (20 - clampedLevel) * 0.025); // 47.5% down to 0%
    const thinkingTimeMs = Math.min(1500, 200 + clampedLevel * 50);

    return {
      level: clampedLevel,
      elo,
      depth,
      blunderRate,
      thinkingTimeMs,
    };
  }

  /**
   * Evaluates position in pawns (+1.5 means White is leading by 1.5 pawns)
   */
  static evaluatePosition(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === "w" ? -99.9 : 99.9;
    }
    if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
      return 0;
    }

    let evaluation = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = PIECE_VALUES[piece.type] || 0;
          let pstBonus = 0;
          const squareIdx = piece.color === "w" ? (7 - r) * 8 + c : r * 8 + c;

          if (piece.type === "p") pstBonus = PAWN_PST[squareIdx] || 0;
          else if (piece.type === "n") pstBonus = KNIGHT_PST[squareIdx] || 0;
          else if (piece.type === "b") pstBonus = BISHOP_PST[squareIdx] || 0;

          const totalPieceValue = val + pstBonus * 0.1;

          if (piece.color === "w") {
            evaluation += totalPieceValue;
          } else {
            evaluation -= totalPieceValue;
          }
        }
      }
    }

    return parseFloat((evaluation / 100).toFixed(1));
  }

  /**
   * Computes best move using Stockfish level 1-20 parameters
   */
  static getBestMove(chess: Chess, level: number = 1, instant: boolean = false): { from: string; to: string; promotion?: string; evalAfter?: number } | null {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const config = this.getLevelConfig(level);

    // Blunder chance check
    if (!instant && Math.random() < config.blunderRate) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion || "q",
      };
    }

    let bestMove = moves[0];
    let bestValue = chess.turn() === "w" ? -Infinity : Infinity;

    for (const move of moves) {
      chess.move(move);
      const val = this.minimax(chess, config.depth - 1, -Infinity, Infinity, chess.turn() === "w");
      chess.undo();

      if (chess.turn() === "w") {
        if (val > bestValue) {
          bestValue = val;
          bestMove = move;
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestMove = move;
        }
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion || "q",
      evalAfter: parseFloat(bestValue.toFixed(1)),
    };
  }

  /**
   * Minimax search with alpha-beta pruning
   */
  private static minimax(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth <= 0 || chess.isGameOver()) {
      return this.evaluatePosition(chess);
    }

    const moves = chess.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalVal = this.minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalVal = this.minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /**
   * Classifies move quality based on evaluation delta
   */
  static classifyMove(evalBefore: number, evalAfter: number, turn: "w" | "b"): MoveClassification {
    const diff = turn === "w" ? evalAfter - evalBefore : evalBefore - evalAfter;

    if (diff >= 2.0) return "brilliant";
    if (diff >= 1.0) return "great";
    if (diff >= 0.2) return "best";
    if (diff >= -0.1) return "excellent";
    if (diff >= -0.4) return "good";
    if (diff >= -0.9) return "inaccuracy";
    if (diff >= -2.0) return "mistake";
    return "blunder";
  }

  /**
   * Recognize current opening
   */
  static identifyOpening(historySan: string[]): OpeningInfo {
    return detectOpening(historySan);
  }

  /**
   * Returns complete FIDE state summary
   */
  static getFideStatus(chess: Chess) {
    return {
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isThreefoldRepetition: chess.isThreefoldRepetition(),
      isInsufficientMaterial: chess.isInsufficientMaterial(),
      isDraw: chess.isDraw(),
      isGameOver: chess.isGameOver(),
    };
  }
}

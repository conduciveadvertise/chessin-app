import { create } from "zustand";
import { Chess, Square } from "chess.js";
import { StockfishEngine } from "./engine";
import { gameRepository } from "../repositories/GameRepository";
import {
  GameMode,
  ChessMoveRecord,
  OpeningInfo,
  TimeControl,
  MoveClassification,
} from "../types/chess";

interface CapturedPiecesState {
  w: string[]; // captured white pieces
  b: string[]; // captured black pieces
}

interface GameState {
  // Game instance
  chess: Chess;
  fen: string;
  pgn: string;
  history: ChessMoveRecord[];
  historyFens: string[];
  currentMoveIndex: number; // For replay navigation

  // Game Metadata
  gameMode: GameMode;
  aiLevel: number; // 1-20
  playerColor: "w" | "b";
  isFlipped: boolean;

  // Analysis & Opening
  evalScore: number;
  opening: OpeningInfo;
  hintMove: { from: string; to: string } | null;

  // Clocks
  whiteTimeMs: number;
  blackTimeMs: number;
  isClockRunning: boolean;
  timeControl: TimeControl;

  // FIDE Status & Winners
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  winner: "w" | "b" | "draw" | null;
  winReason: string | null;

  // Captured Pieces
  capturedPieces: CapturedPiecesState;

  // Database ID if saved
  dbGameId: string | null;

  // Actions
  initGame: (config?: {
    mode?: GameMode;
    aiLevel?: number;
    timeControl?: TimeControl;
    playerColor?: "w" | "b";
    initialFen?: string;
  }) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  makeAiMove: () => void;
  undoMove: () => boolean;
  jumpToMove: (index: number) => void;
  flipBoard: () => void;
  requestHint: () => void;
  resign: (player: "w" | "b") => void;
  offerDraw: () => void;
  exportFen: () => string;
  exportPgn: () => string;
  importFen: (fen: string) => boolean;
  importPgn: (pgn: string) => boolean;
  tickClock: (deltaMs: number) => void;
  pauseClock: () => void;
  resumeClock: () => void;
  saveGameToDb: (userId: string, title: string) => Promise<boolean>;
}

const DEFAULT_TIME_CONTROL: TimeControl = {
  name: "Rapid 10+0",
  initial: 600,
  increment: 0,
  category: "rapid",
};

export const useGameStore = create<GameState>((set, get) => ({
  chess: new Chess(),
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  pgn: "",
  history: [],
  historyFens: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
  currentMoveIndex: 0,

  gameMode: "vs_ai",
  aiLevel: 1,
  playerColor: "w",
  isFlipped: false,

  evalScore: 0,
  opening: { eco: "A00", name: "Starting Position" },
  hintMove: null,

  whiteTimeMs: 600000,
  blackTimeMs: 600000,
  isClockRunning: false,
  timeControl: DEFAULT_TIME_CONTROL,

  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  isDraw: false,
  isGameOver: false,
  winner: null,
  winReason: null,

  capturedPieces: { w: [], b: [] },
  dbGameId: null,

  initGame: (config) => {
    const game = new Chess(config?.initialFen);
    const mode = config?.mode || "vs_ai";
    const aiLevel = config?.aiLevel || 1;
    const tc = config?.timeControl || DEFAULT_TIME_CONTROL;
    const playerColor = config?.playerColor || "w";

    const initialFen = game.fen();
    const initEval = StockfishEngine.evaluatePosition(game);

    set({
      chess: game,
      fen: initialFen,
      pgn: "",
      history: [],
      historyFens: [initialFen],
      currentMoveIndex: 0,
      gameMode: mode,
      aiLevel,
      playerColor,
      isFlipped: playerColor === "b",
      evalScore: initEval,
      opening: { eco: "A00", name: "Starting Position" },
      hintMove: null,
      whiteTimeMs: tc.initial * 1000,
      blackTimeMs: tc.initial * 1000,
      isClockRunning: false,
      timeControl: tc,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      isGameOver: false,
      winner: null,
      winReason: null,
      capturedPieces: { w: [], b: [] },
      dbGameId: null,
    });
  },

  makeMove: (from: string, to: string, promotion = "q") => {
    const { chess, history, historyFens, evalScore, capturedPieces, timeControl, gameMode, playerColor } = get();

    if (chess.isGameOver()) return false;

    try {
      const moveResult = chess.move({ from, to, promotion });
      if (!moveResult) return false;

      const newFen = chess.fen();
      const newEval = StockfishEngine.evaluatePosition(chess);
      const classification = StockfishEngine.classifyMove(evalScore, newEval, moveResult.color);
      const sanHistory = chess.history();
      const opening = StockfishEngine.identifyOpening(sanHistory);

      // Track captured pieces
      const updatedCaptured = { ...capturedPieces };
      if (moveResult.captured) {
        if (moveResult.color === "w") {
          updatedCaptured.b.push(moveResult.captured);
        } else {
          updatedCaptured.w.push(moveResult.captured);
        }
      }

      const moveRecord: ChessMoveRecord = {
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece,
        san: moveResult.san,
        captured: moveResult.captured,
        promotion: moveResult.promotion,
        fen: newFen,
        evalBefore: evalScore,
        evalAfter: newEval,
        classification,
      };

      const newHistory = [...history, moveRecord];
      const newFens = [...historyFens, newFen];
      const fide = StockfishEngine.getFideStatus(chess);

      let winner: "w" | "b" | "draw" | null = null;
      let winReason: string | null = null;

      if (fide.isCheckmate) {
        winner = chess.turn() === "w" ? "b" : "w";
        winReason = "checkmate";
      } else if (fide.isStalemate) {
        winner = "draw";
        winReason = "stalemate";
      } else if (fide.isThreefoldRepetition) {
        winner = "draw";
        winReason = "threefold";
      } else if (fide.isInsufficientMaterial) {
        winner = "draw";
        winReason = "insufficient_material";
      } else if (fide.isDraw) {
        winner = "draw";
        winReason = "fifty_move";
      }

      // Add time increment
      let { whiteTimeMs, blackTimeMs } = get();
      if (moveResult.color === "w") {
        whiteTimeMs += timeControl.increment * 1000;
      } else {
        blackTimeMs += timeControl.increment * 1000;
      }

      set({
        fen: newFen,
        pgn: chess.pgn(),
        history: newHistory,
        historyFens: newFens,
        currentMoveIndex: newHistory.length,
        evalScore: newEval,
        opening,
        hintMove: null,
        capturedPieces: updatedCaptured,
        isCheck: fide.isCheck,
        isCheckmate: fide.isCheckmate,
        isStalemate: fide.isStalemate,
        isDraw: fide.isDraw,
        isGameOver: fide.isGameOver,
        winner,
        winReason,
        whiteTimeMs,
        blackTimeMs,
        isClockRunning: !fide.isGameOver,
      });

      // Auto trigger AI move if VS AI mode and game is not over
      if (gameMode === "vs_ai" && !fide.isGameOver && chess.turn() !== playerColor) {
        setTimeout(() => {
          get().makeAiMove();
        }, 300);
      }

      return true;
    } catch (err) {
      console.error("Illegal move attempted:", err);
      return false;
    }
  },

  makeAiMove: () => {
    const { chess, aiLevel } = get();
    if (chess.isGameOver()) return;

    const bestMove = StockfishEngine.getBestMove(chess, aiLevel);
    if (bestMove) {
      get().makeMove(bestMove.from, bestMove.to, bestMove.promotion);
    }
  },

  undoMove: () => {
    const { chess, gameMode, history } = get();
    if (history.length === 0) return false;

    // In AI mode, undo twice (player + AI move)
    const undoCount = gameMode === "vs_ai" && history.length >= 2 ? 2 : 1;

    for (let i = 0; i < undoCount; i++) {
      chess.undo();
    }

    const newFen = chess.fen();
    const newHistory = history.slice(0, history.length - undoCount);
    const newFens = get().historyFens.slice(0, get().historyFens.length - undoCount);
    const newEval = StockfishEngine.evaluatePosition(chess);
    const fide = StockfishEngine.getFideStatus(chess);

    set({
      fen: newFen,
      pgn: chess.pgn(),
      history: newHistory,
      historyFens: newFens,
      currentMoveIndex: newHistory.length,
      evalScore: newEval,
      isCheck: fide.isCheck,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      isGameOver: false,
      winner: null,
      winReason: null,
    });

    return true;
  },

  jumpToMove: (index: number) => {
    const { historyFens, history } = get();
    if (index < 0 || index >= historyFens.length) return;

    const targetFen = historyFens[index];
    const newChess = new Chess(targetFen);

    set({
      chess: newChess,
      fen: targetFen,
      currentMoveIndex: index,
      evalScore: StockfishEngine.evaluatePosition(newChess),
    });
  },

  flipBoard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  requestHint: () => {
    const { chess } = get();
    if (chess.isGameOver()) return;

    const best = StockfishEngine.getBestMove(chess, 20, true);
    if (best) {
      set({ hintMove: { from: best.from, to: best.to } });
    }
  },

  resign: (player: "w" | "b") => {
    const winner = player === "w" ? "b" : "w";
    set({
      isGameOver: true,
      winner,
      winReason: "resignation",
      isClockRunning: false,
    });
  },

  offerDraw: () => {
    set({
      isGameOver: true,
      winner: "draw",
      winReason: "agreement",
      isClockRunning: false,
    });
  },

  exportFen: () => get().chess.fen(),

  exportPgn: () => get().chess.pgn(),

  importFen: (fenStr: string) => {
    try {
      const game = new Chess(fenStr);
      set({
        chess: game,
        fen: game.fen(),
        pgn: "",
        history: [],
        historyFens: [game.fen()],
        currentMoveIndex: 0,
        evalScore: StockfishEngine.evaluatePosition(game),
        isGameOver: game.isGameOver(),
      });
      return true;
    } catch {
      return false;
    }
  },

  importPgn: (pgnStr: string) => {
    try {
      const game = new Chess();
      game.loadPgn(pgnStr);
      set({
        chess: game,
        fen: game.fen(),
        pgn: pgnStr,
        evalScore: StockfishEngine.evaluatePosition(game),
        isGameOver: game.isGameOver(),
      });
      return true;
    } catch {
      return false;
    }
  },

  tickClock: (deltaMs: number) => {
    const { isClockRunning, chess, whiteTimeMs, blackTimeMs } = get();
    if (!isClockRunning) return;

    const turn = chess.turn();

    if (turn === "w") {
      const nextTime = Math.max(0, whiteTimeMs - deltaMs);
      if (nextTime === 0) {
        set({
          whiteTimeMs: 0,
          isGameOver: true,
          winner: "b",
          winReason: "timeout",
          isClockRunning: false,
        });
      } else {
        set({ whiteTimeMs: nextTime });
      }
    } else {
      const nextTime = Math.max(0, blackTimeMs - deltaMs);
      if (nextTime === 0) {
        set({
          blackTimeMs: 0,
          isGameOver: true,
          winner: "w",
          winReason: "timeout",
          isClockRunning: false,
        });
      } else {
        set({ blackTimeMs: nextTime });
      }
    }
  },

  pauseClock: () => set({ isClockRunning: false }),

  resumeClock: () => set({ isClockRunning: true }),

  saveGameToDb: async (userId: string, title: string) => {
    const { fen, pgn, timeControl, gameMode } = get();
    const saved = await gameRepository.saveGameForUser(userId, title, fen, pgn, timeControl.name, gameMode);
    return Boolean(saved);
  },
}));

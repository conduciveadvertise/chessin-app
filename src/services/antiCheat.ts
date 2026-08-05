import { ChessMoveRecord } from "../types/chess";

export interface AntiCheatReport {
  userId: string;
  matchId: string;
  accuracyPct: number;
  averageMoveTimeMs: number;
  suspiciousFlag: boolean;
  flagReason?: string;
}

export class AntiCheatEngine {
  /**
   * Analyzes move times and evaluation deltas for suspicious patterns
   */
  static analyzeGame(userId: string, matchId: string, history: ChessMoveRecord[]): AntiCheatReport {
    if (!history || history.length < 5) {
      return {
        userId,
        matchId,
        accuracyPct: 100,
        averageMoveTimeMs: 1500,
        suspiciousFlag: false,
      };
    }

    let totalMoveTime = 0;
    let bestOrBrilliantCount = 0;
    let instantComplexMoves = 0; // Moves made in <200ms that are brilliant/best in complex positions

    history.forEach((m) => {
      const timeSpent = m.timeSpentMs || 1200;
      totalMoveTime += timeSpent;

      if (m.classification === "best" || m.classification === "brilliant" || m.classification === "great") {
        bestOrBrilliantCount++;
        if (timeSpent < 300) {
          instantComplexMoves++;
        }
      }
    });

    const avgTimeMs = Math.round(totalMoveTime / history.length);
    const accuracyPct = Math.min(100, Math.round((bestOrBrilliantCount / history.length) * 100));

    let suspiciousFlag = false;
    let flagReason: string | undefined = undefined;

    // Trigger conditions:
    // 1. Accuracy > 96% with more than 15 moves
    // 2. High frequency of instant complex engine moves (> 4 moves under 300ms)
    if (history.length >= 15 && accuracyPct >= 96) {
      suspiciousFlag = true;
      flagReason = "Suspiciously high accuracy (>96%) across complex game";
    } else if (instantComplexMoves >= 4) {
      suspiciousFlag = true;
      flagReason = "Engine timing anomaly: instant best moves detected";
    }

    return {
      userId,
      matchId,
      accuracyPct,
      averageMoveTimeMs: avgTimeMs,
      suspiciousFlag,
      flagReason,
    };
  }
}

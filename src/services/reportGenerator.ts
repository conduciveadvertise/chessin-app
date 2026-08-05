import { ChessMoveRecord, MoveClassification } from "../types/chess";

export interface GameReportData {
  accuracy: {
    white: number;
    black: number;
  };
  classificationsCount: {
    brilliant: number;
    great: number;
    best: number;
    excellent: number;
    good: number;
    inaccuracy: number;
    mistake: number;
    blunder: number;
  };
  averageCentipawnLoss: {
    white: number;
    black: number;
  };
  evalGraph: number[];
  openingName: string;
  summaryText: string;
}

export class ReportGenerator {
  static generateReport(history: ChessMoveRecord[], openingName: string = "Standard Opening"): GameReportData {
    const counts = {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    };

    let whiteCplTotal = 0;
    let blackCplTotal = 0;
    let whiteMovesCount = 0;
    let blackMovesCount = 0;

    const evalGraph: number[] = [0];

    history.forEach((m, idx) => {
      const isWhite = idx % 2 === 0;

      if (m.classification && counts[m.classification] !== undefined) {
        counts[m.classification]++;
      } else {
        counts.good++;
      }

      const evalBefore = m.evalBefore || 0;
      const evalAfter = m.evalAfter || 0;
      evalGraph.push(evalAfter);

      const delta = Math.abs(evalAfter - evalBefore) * 100; // convert pawns to centipawns

      if (isWhite) {
        whiteCplTotal += delta;
        whiteMovesCount++;
      } else {
        blackCplTotal += delta;
        blackMovesCount++;
      }
    });

    const whiteAvgCpl = whiteMovesCount > 0 ? Math.round(whiteCplTotal / whiteMovesCount) : 15;
    const blackAvgCpl = blackMovesCount > 0 ? Math.round(blackCplTotal / blackMovesCount) : 15;

    // Convert CPL to estimated accuracy % (FIDE formula approximation: 100 - CPL / 2)
    const whiteAcc = Math.max(20, Math.min(99, Math.round(100 - whiteAvgCpl / 2)));
    const blackAcc = Math.max(20, Math.min(99, Math.round(100 - blackAvgCpl / 2)));

    let summaryText = `A competitive match featuring the ${openingName}. White played with ${whiteAcc}% accuracy while Black played with ${blackAcc}% accuracy.`;

    if (counts.brilliant > 0) {
      summaryText += ` Included ${counts.brilliant} brilliant move(s)!`;
    }

    return {
      accuracy: {
        white: whiteAcc,
        black: blackAcc,
      },
      classificationsCount: counts,
      averageCentipawnLoss: {
        white: whiteAvgCpl,
        black: blackAvgCpl,
      },
      evalGraph,
      openingName,
      summaryText,
    };
  }
}

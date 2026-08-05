export interface OpeningEntry {
  eco: string;
  name: string;
  moves: string; // FEN prefix or move sequence
}

export const COMMON_OPENINGS: OpeningEntry[] = [
  { eco: "A00", name: "Uncommon Opening", moves: "" },
  { eco: "B00", name: "King's Pawn Game", moves: "e4" },
  { eco: "B07", name: "Pirc Defense", moves: "e4 d6" },
  { eco: "B10", name: "Caro-Kann Defense", moves: "e4 c6" },
  { eco: "B20", name: "Sicilian Defense", moves: "e4 c5" },
  { eco: "B30", name: "Sicilian Defense: Old Sicilian", moves: "e4 c5 Nf3 Nc6" },
  { eco: "B90", name: "Sicilian Defense: Najdorf Variation", moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc6 a6" },
  { eco: "C00", name: "French Defense", moves: "e4 e6" },
  { eco: "C20", name: "King's Pawn Game: Open Game", moves: "e4 e5" },
  { eco: "C42", name: "Petrov's Defense", moves: "e4 e5 Nf3 Nf6" },
  { eco: "C50", name: "Italian Game", moves: "e4 e5 Nf3 Nc6 Bc4" },
  { eco: "C60", name: "Ruy Lopez (Spanish Opening)", moves: "e4 e5 Nf3 Nc6 Bb5" },
  { eco: "D00", name: "Queen's Pawn Game", moves: "d4" },
  { eco: "D02", name: "London System", moves: "d4 d5 Nf3 Nf6 Bf4" },
  { eco: "D06", name: "Queen's Gambit", moves: "d4 d5 c4" },
  { eco: "D10", name: "Slav Defense", moves: "d4 d5 c4 c6" },
  { eco: "D30", name: "Queen's Gambit Declined", moves: "d4 d5 c4 e6" },
  { eco: "E00", name: "Catalan Opening", moves: "d4 Nf6 c4 e6 g3" },
  { eco: "E60", name: "King's Indian Defense", moves: "d4 Nf6 c4 g6" },
];

export function detectOpening(historySan: string[]): OpeningEntry {
  if (!historySan || historySan.length === 0) {
    return { eco: "A00", name: "Starting Position", moves: "" };
  }

  const pgnStr = historySan.join(" ");

  for (let i = COMMON_OPENINGS.length - 1; i >= 0; i--) {
    const op = COMMON_OPENINGS[i];
    if (op.moves && pgnStr.startsWith(op.moves)) {
      return op;
    }
  }

  return { eco: "A00", name: "Custom Opening", moves: "" };
}

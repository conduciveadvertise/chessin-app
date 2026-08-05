import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { StockfishEngine } from "../services/engine";
import { ChessBoard } from "../components/ChessBoard";
import { EvalBar } from "../components/EvalBar";
import { MoveHistory } from "../components/MoveHistory";
import { AiCoachPanel } from "../components/AiCoachPanel";
import { GameSettings } from "../types/chess";
import { BarChart3, ChevronLeft, Copy, Check, RefreshCw } from "lucide-react-native";

interface AnalysisViewProps {
  settings: GameSettings;
  onBackToHome: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ settings, onBackToHome }) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [fenInput, setFenInput] = useState<string>(chess.fen());
  const [fen, setFen] = useState<string>(chess.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [evalScore, setEvalScore] = useState<number>(0.0);
  const [orientation, setOrientation] = useState<"w" | "b">("w");

  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (moveObj) {
        const newFen = chess.fen();
        setFen(newFen);
        setFenInput(newFen);
        setHistory(chess.history());
        setLastMove({ from: moveObj.from, to: moveObj.to });
        setEvalScore(StockfishEngine.evaluatePosition(chess));
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  };

  const handleApplyFen = () => {
    try {
      chess.load(fenInput.trim());
      setFen(chess.fen());
      setHistory([]);
      setLastMove(null);
      setEvalScore(StockfishEngine.evaluatePosition(chess));
    } catch (e) {
      // invalid fen
    }
  };

  const handleReset = () => {
    chess.reset();
    const startFen = chess.fen();
    setFen(startFen);
    setFenInput(startFen);
    setHistory([]);
    setLastMove(null);
    setEvalScore(0.0);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Analysis</Text>
        </Pressable>

        <View style={styles.badge}>
          <BarChart3 size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Analysis Engine</Text>
        </View>
      </View>

      <View style={styles.boardWrap}>
        {settings.showEvalBar && (
          <View style={{ height: 320 }}>
            <EvalBar score={evalScore} orientation={orientation} />
          </View>
        )}
        <ChessBoard
          chess={chess}
          boardTheme={settings.boardTheme}
          pieceTheme={settings.pieceTheme}
          orientation={orientation}
          highlightLegalMoves={settings.highlightLegalMoves}
          onMove={handleMove}
          lastMove={lastMove}
        />
      </View>

      {/* FEN Control Form */}
      <View style={styles.fenCard}>
        <Text style={styles.fenLabel}>FEN POSITION</Text>
        <View style={styles.fenRow}>
          <TextInput
            value={fenInput}
            onChangeText={setFenInput}
            style={styles.fenInput}
            placeholderTextColor="#71717A"
          />
          <Pressable onPress={handleApplyFen} style={styles.loadBtn}>
            <Text style={styles.loadBtnText}>Load</Text>
          </Pressable>
          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <RefreshCw size={14} color="#D4AF37" />
          </Pressable>
        </View>
      </View>

      <MoveHistory
        history={history}
        onFlipBoard={() => setOrientation(orientation === "w" ? "b" : "w")}
      />
      <AiCoachPanel
        fen={fen}
        lastMoveSan={history[history.length - 1]}
        pgn={chess.pgn()}
        evalScore={evalScore}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  content: {
    padding: 16,
    paddingBottom: 80,
    gap: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exitBtnText: {
    color: "#E4E4E7",
    fontSize: 11,
    fontWeight: "bold",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  boardWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fenCard: {
    backgroundColor: "#0A0A0C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 14,
    gap: 8,
  },
  fenLabel: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  fenRow: {
    flexDirection: "row",
    gap: 8,
  },
  fenInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#FFF",
    fontSize: 11,
  },
  loadBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "center",
  },
  loadBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 11,
  },
  resetBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
});

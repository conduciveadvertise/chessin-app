import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { StockfishEngine } from "../services/engine";
import { ChessBoard } from "../components/ChessBoard";
import { EvalBar } from "../components/EvalBar";
import { MoveHistory } from "../components/MoveHistory";
import { AiCoachPanel } from "../components/AiCoachPanel";
import { GameSettings } from "../types/chess";
import { BarChart3, ChevronLeft, Copy, Check, RefreshCw, Search } from "lucide-react-native";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

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

  const evalColor = evalScore > 0.5 ? "#34D399" : evalScore < -0.5 ? "#F87171" : "#A1A1AA";
  const evalLabel =
    evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Analysis</Text>
        </Pressable>

        <View style={styles.badge}>
          <BarChart3 size={14} color={GOLD[300]} />
          <Text style={styles.badgeText}>Analysis Engine</Text>
        </View>
      </View>

      {/* Eval Score Bar */}
      <View style={styles.evalBar}>
        <View style={styles.evalLabelBox}>
          <Text style={[styles.evalValue, { color: evalColor }]}>
            {evalLabel}
          </Text>
          <Text style={styles.evalLabelText}>EVAL</Text>
        </View>
        <View style={styles.evalMeter}>
          <View
            style={[
              styles.evalMeterFill,
              {
                width: `${Math.max(5, Math.min(95, 50 + evalScore * 25))}%`,
                backgroundColor: evalColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Board */}
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

      {/* ═══ FEN Control ═══ */}
      <View style={styles.fenCard}>
        <Text style={styles.fenLabel}>FEN POSITION</Text>
        <View style={styles.fenRow}>
          <TextInput
            value={fenInput}
            onChangeText={setFenInput}
            style={styles.fenInput}
            placeholderTextColor="#52525B"
          />
          <Pressable onPress={handleApplyFen} style={styles.loadBtn}>
            <Text style={styles.loadBtnText}>Load</Text>
          </Pressable>
          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <RefreshCw size={14} color={GOLD[300]} />
          </Pressable>
        </View>
      </View>

      {/* Move History */}
      <MoveHistory
        history={history}
        onFlipBoard={() => setOrientation(orientation === "w" ? "b" : "w")}
      />

      {/* AI Coach */}
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
    backgroundColor: DARK[800],
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.1)",
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    ...glassCardSubtle,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
  },
  // ═══ Eval Bar ═══
  evalBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...glassCard,
    borderRadius: 16,
    padding: 14,
  },
  evalLabelBox: {
    alignItems: "center",
    minWidth: 50,
  },
  evalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  evalLabelText: {
    color: "#52525B",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 2,
  },
  evalMeter: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  evalMeterFill: {
    height: "100%",
    borderRadius: 4,
  },
  // ═══ Board ═══
  boardWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  // ═══ FEN ═══
  fenCard: {
    ...glassCard,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  fenLabel: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  fenRow: {
    flexDirection: "row",
    gap: 8,
  },
  fenInput: {
    flex: 1,
    ...glassCardSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 11,
  },
  loadBtn: {
    backgroundColor: GOLD[300],
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loadBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 11,
  },
  resetBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { CapturedPieces } from "../components/CapturedPieces";
import { MoveHistory } from "../components/MoveHistory";
import { GameSettings } from "../types/chess";
import { Users, RotateCcw, ChevronLeft, RefreshCw } from "lucide-react-native";

interface PlayPassViewProps {
  settings: GameSettings;
  onBackToHome: () => void;
}

export const PlayPassView: React.FC<PlayPassViewProps> = ({
  settings,
  onBackToHome,
}) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [captured, setCaptured] = useState<Array<{ type: any; color: any }>>([]);
  const [orientation, setOrientation] = useState<"w" | "b">("w");

  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (moveObj) {
        setFen(chess.fen());
        setHistory(chess.history());
        setLastMove({ from: moveObj.from, to: moveObj.to });

        const capList: Array<{ type: any; color: any }> = [];
        chess.history({ verbose: true }).forEach((m) => {
          if (m.captured) capList.push({ type: m.captured, color: m.color === "w" ? "b" : "w" });
        });
        setCaptured(capList);

        if (moveObj.captured) soundManager.playCapture();
        else soundManager.playMove();

        if (settings.autoFlipBoard) {
          setOrientation(chess.turn());
        }
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    chess.undo();
    setFen(chess.fen());
    setHistory(chess.history());
    setLastMove(null);
  };

  const handleReset = () => {
    chess.reset();
    setFen(chess.fen());
    setHistory([]);
    setLastMove(null);
    setCaptured([]);
    soundManager.playGameStart();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Local Match</Text>
        </Pressable>

        <View style={styles.badge}>
          <Users size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Pass & Play</Text>
        </View>
      </View>

      <View style={styles.gameLayout}>
        <CapturedPieces captured={captured} pieceTheme={settings.pieceTheme} />

        <View style={styles.boardWrap}>
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

        <View style={styles.actionRow}>
          <Pressable onPress={handleUndo} disabled={history.length === 0} style={styles.controlBtn}>
            <RotateCcw size={14} color="#E4E4E7" />
            <Text style={styles.controlBtnText}>Undo</Text>
          </Pressable>

          <Pressable
            onPress={() => setOrientation(orientation === "w" ? "b" : "w")}
            style={styles.controlBtn}
          >
            <Text style={styles.controlBtnText}>Flip</Text>
          </Pressable>

          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <RefreshCw size={14} color="#D4AF37" />
            <Text style={styles.resetBtnText}>New Game</Text>
          </Pressable>
        </View>

        <MoveHistory
          history={history}
          onUndo={handleUndo}
          onFlipBoard={() => setOrientation(orientation === "w" ? "b" : "w")}
        />
      </View>
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
  gameLayout: {
    gap: 12,
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0A0A0C",
    padding: 12,
    borderRadius: 16,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  controlBtnText: {
    color: "#E4E4E7",
    fontSize: 11,
    fontWeight: "bold",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetBtnText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { StockfishEngine } from "../services/engine";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { Clock } from "../components/Clock";
import { EvalBar } from "../components/EvalBar";
import { CapturedPieces } from "../components/CapturedPieces";
import { MoveHistory } from "../components/MoveHistory";
import { AiCoachPanel } from "../components/AiCoachPanel";
import { GameAnalysisModal } from "../components/GameAnalysisModal";
import { GameSettings, UserProfile } from "../types/chess";
import { useGameStore } from "../services/gameStore";
import {
  Bot,
  RotateCcw,
  Flag,
  BarChart3,
  ChevronLeft,
  Lightbulb,
  Bookmark,
  Check,
  Copy,
} from "lucide-react-native";

interface PlayVsAiViewProps {
  user: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
}

export const PlayVsAiView: React.FC<PlayVsAiViewProps> = ({
  user,
  settings,
  onBackToHome,
}) => {
  const {
    chess,
    fen,
    history,
    evalScore,
    opening,
    aiLevel,
    playerColor,
    isFlipped,
    capturedPieces,
    isGameOver,
    winner,
    winReason,
    initGame,
    makeMove,
    undoMove,
    flipBoard,
    requestHint,
    resign,
    exportPgn,
    saveGameToDb,
  } = useGameStore();

  const [selectedLevel, setSelectedLevel] = useState<number>(10);
  const [selectedColor, setSelectedColor] = useState<"w" | "b">("w");
  const [selectedTimeSec, setSelectedTimeSec] = useState<number>(600);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedPgn, setCopiedPgn] = useState<boolean>(false);

  const handleStartGame = () => {
    initGame({
      mode: "vs_ai",
      aiLevel: selectedLevel,
      playerColor: selectedColor,
      timeControl: {
        name: `${selectedTimeSec / 60}m`,
        initial: selectedTimeSec,
        increment: 0,
        category: "rapid",
      },
    });
    setIsGameStarted(true);
    setIsSaved(false);
    soundManager.playGameStart();
  };

  const handleUserMove = (from: string, to: string, promotion?: string) => {
    if (isGameOver) return;
    const success = makeMove(from, to, promotion);
    if (success) {
      soundManager.playMove();
    }
  };

  const handleSaveGame = async () => {
    if (!user.id) return;
    const ok = await saveGameToDb(user.id, `Vs Stockfish Level ${aiLevel}`);
    if (ok) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Arena</Text>
        </Pressable>

        <View style={styles.levelBadge}>
          <Bot size={14} color="#D4AF37" />
          <Text style={styles.levelBadgeText}>
            Stockfish 17 (Lvl {aiLevel} / ~{StockfishEngine.getLevelConfig(aiLevel).elo} ELO)
          </Text>
        </View>
      </View>

      {!isGameStarted ? (
        /* Setup Screen */
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Stockfish 17 Arena</Text>
          <Text style={styles.setupSub}>Configure match parameters</Text>

          {/* Level selector buttons */}
          <View>
            <Text style={styles.label}>
              ENGINE LEVEL: {selectedLevel} (~
              {StockfishEngine.getLevelConfig(selectedLevel).elo} ELO)
            </Text>
            <View style={styles.levelRow}>
              {[1, 5, 10, 15, 20].map((lvl) => (
                <Pressable
                  key={lvl}
                  onPress={() => setSelectedLevel(lvl)}
                  style={[styles.levelBtn, selectedLevel === lvl && styles.activeLevelBtn]}
                >
                  <Text
                    style={[styles.levelBtnText, selectedLevel === lvl && styles.activeLevelBtnText]}
                  >
                    Lvl {lvl}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View>
            <Text style={styles.label}>SIDE</Text>
            <View style={styles.grid2}>
              <Pressable
                onPress={() => setSelectedColor("w")}
                style={[styles.optionBtn, selectedColor === "w" && styles.activeOptionBtn]}
              >
                <Text style={[styles.optionText, selectedColor === "w" && styles.activeOptionText]}>
                  White
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedColor("b")}
                style={[styles.optionBtn, selectedColor === "b" && styles.activeOptionBtn]}
              >
                <Text style={[styles.optionText, selectedColor === "b" && styles.activeOptionText]}>
                  Black
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Time Control */}
          <View>
            <Text style={styles.label}>TIME CONTROL</Text>
            <View style={styles.grid3}>
              {[
                { label: "3m Bullet", val: 180 },
                { label: "5m Blitz", val: 300 },
                { label: "10m Rapid", val: 600 },
              ].map((tc) => (
                <Pressable
                  key={tc.val}
                  onPress={() => setSelectedTimeSec(tc.val)}
                  style={[styles.optionBtn, selectedTimeSec === tc.val && styles.activeOptionBtn]}
                >
                  <Text style={[styles.optionText, selectedTimeSec === tc.val && styles.activeOptionText]}>
                    {tc.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={handleStartGame} style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Match</Text>
          </Pressable>
        </View>
      ) : (
        /* Active Game Layout */
        <View style={styles.gameLayout}>
          {/* Opening info */}
          <View style={styles.openingRow}>
            <Text style={styles.openingText}>
              {opening.eco} — {opening.name}
            </Text>
            <View style={styles.openingActions}>
              <Pressable onPress={requestHint} style={styles.hintBtn}>
                <Lightbulb size={12} color="#D4AF37" />
                <Text style={styles.hintBtnText}>Hint</Text>
              </Pressable>
              <Pressable onPress={handleSaveGame} style={styles.saveBtn}>
                <Bookmark size={12} color="#E4E4E7" />
                <Text style={styles.saveBtnText}>{isSaved ? "Saved" : "Save"}</Text>
              </Pressable>
            </View>
          </View>

          {/* Bot Clock */}
          <Clock
            initialTime={selectedTimeSec}
            isActive={chess.turn() !== playerColor && !isGameOver}
            onTimeOut={() => {}}
            playerColor={playerColor === "w" ? "b" : "w"}
            playerName={`Stockfish Lvl ${aiLevel}`}
            playerTitle="ENGINE"
            playerRating={StockfishEngine.getLevelConfig(aiLevel).elo}
            avatar="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"
          />

          <CapturedPieces
            captured={[
              ...capturedPieces.w.map((p) => ({ type: p as any, color: "w" as const })),
              ...capturedPieces.b.map((p) => ({ type: p as any, color: "b" as const })),
            ]}
            pieceTheme={settings.pieceTheme}
          />

          {/* Board */}
          <View style={styles.boardWrap}>
            {settings.showEvalBar && (
              <View style={{ height: 320 }}>
                <EvalBar score={evalScore} orientation={isFlipped ? "b" : "w"} />
              </View>
            )}
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation={isFlipped ? "b" : "w"}
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleUserMove}
              disabled={isGameOver}
              lastMove={
                history.length > 0
                  ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
                  : null
              }
            />
          </View>

          {/* Player Clock */}
          <Clock
            initialTime={selectedTimeSec}
            isActive={chess.turn() === playerColor && !isGameOver}
            onTimeOut={() => {}}
            playerColor={playerColor}
            playerName={user.name}
            playerTitle={user.title}
            playerRating={user.rating.rapid}
            avatar={user.avatar}
          />

          {/* Controls */}
          <View style={styles.actionRow}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable onPress={undoMove} disabled={history.length === 0} style={styles.controlBtn}>
                <RotateCcw size={14} color="#E4E4E7" />
                <Text style={styles.controlBtnText}>Undo</Text>
              </Pressable>
              <Pressable onPress={flipBoard} style={styles.controlBtn}>
                <Text style={styles.controlBtnText}>Flip</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable onPress={() => resign(playerColor)} disabled={isGameOver} style={styles.resignBtn}>
                <Flag size={14} color="#FDA4AF" />
                <Text style={styles.resignBtnText}>Resign</Text>
              </Pressable>
              {isGameOver && (
                <Pressable onPress={() => setShowAnalysisModal(true)} style={styles.analysisBtn}>
                  <BarChart3 size={14} color="#000" />
                  <Text style={styles.analysisBtnText}>Analysis</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* History & Coach */}
          <MoveHistory history={history.map((m) => m.san)} onUndo={undoMove} onFlipBoard={flipBoard} />
          <AiCoachPanel
            fen={fen}
            lastMoveSan={history.length > 0 ? history[history.length - 1].san : ""}
            pgn={exportPgn()}
            evalScore={evalScore}
            difficulty={aiLevel >= 15 ? "grandmaster" : aiLevel >= 10 ? "hard" : aiLevel >= 5 ? "medium" : "easy"}
          />
        </View>
      )}

      {showAnalysisModal && (
        <GameAnalysisModal
          pgn={exportPgn()}
          resultText={
            winner === "draw" ? "Game Drawn" : `${winner === "w" ? "White" : "Black"} Won by ${winReason}`
          }
          movesCount={history.length}
          playerColor={playerColor === "w" ? "White" : "Black"}
          onClose={() => setShowAnalysisModal(false)}
          onRematch={handleStartGame}
        />
      )}
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
  levelBadge: {
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
  levelBadgeText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  setupCard: {
    backgroundColor: "#0A0A0C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    gap: 16,
  },
  setupTitle: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  setupSub: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
  },
  label: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  levelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  activeLevelBtn: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  levelBtnText: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeLevelBtnText: {
    color: "#000",
  },
  grid2: {
    flexDirection: "row",
    gap: 10,
  },
  grid3: {
    flexDirection: "row",
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  activeOptionBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  optionText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeOptionText: {
    color: "#D4AF37",
  },
  startBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
  },
  startBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  gameLayout: {
    gap: 12,
  },
  openingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0A0A0C",
    padding: 10,
    borderRadius: 12,
  },
  openingText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
  },
  openingActions: {
    flexDirection: "row",
    gap: 6,
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintBtnText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveBtnText: {
    color: "#E4E4E7",
    fontSize: 10,
  },
  boardWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0A0A0C",
    padding: 12,
    borderRadius: 16,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  controlBtnText: {
    color: "#E4E4E7",
    fontSize: 10,
    fontWeight: "bold",
  },
  resignBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(159, 18, 57, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resignBtnText: {
    color: "#FDA4AF",
    fontSize: 10,
    fontWeight: "bold",
  },
  analysisBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  analysisBtnText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
});

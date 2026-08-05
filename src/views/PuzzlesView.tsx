import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { GameSettings, UserProfile } from "../types/chess";
import { PuzzleTheme, PuzzleRecord } from "../types/learning";
import { learningRepository } from "../repositories/LearningRepository";
import {
  Puzzle,
  Lightbulb,
  ChevronLeft,
  Flame,
  Zap,
  RotateCcw,
  CheckCircle2,
  Filter,
  Crown,
  Target,
} from "lucide-react-native";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface PuzzlesViewProps {
  user?: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
  onSolvePuzzle?: () => void;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  user,
  settings,
  onBackToHome,
  onSolvePuzzle,
}) => {
  const [activeTab, setActiveTab] = useState<"daily" | "rush" | "tactics">("daily");

  const [dailyPuzzle, setDailyPuzzle] = useState<PuzzleRecord | null>(null);
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>("");
  const [solved, setSolved] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [dailyStreak, setDailyStreak] = useState<number>(5);
  const [puzzleRating, setPuzzleRating] = useState<number>(1540);

  const [selectedTheme, setSelectedTheme] = useState<PuzzleTheme>("mate_in_1");
  const [themePuzzles, setThemePuzzles] = useState<PuzzleRecord[]>([]);

  useEffect(() => {
    learningRepository.getDailyPuzzle().then((p) => {
      setDailyPuzzle(p);
      chess.load(p.fen);
      setFen(chess.fen());
    });
  }, [chess]);

  useEffect(() => {
    learningRepository.getPuzzlesByTheme(selectedTheme).then((list) => {
      setThemePuzzles(list);
      if (list.length > 0) {
        chess.load(list[0].fen);
        setFen(chess.fen());
        setSolved(false);
      }
    });
  }, [selectedTheme, chess]);

  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (moveObj) {
        setFen(chess.fen());

        if (activeTab === "daily" && dailyPuzzle) {
          const expected = dailyPuzzle.moves[0];
          if (moveObj.san === expected || moveObj.from + moveObj.to === expected) {
            soundManager.playVictory();
            setSolved(true);
            setDailyStreak((s) => s + 1);
            setPuzzleRating((r) => r + 15);
            if (onSolvePuzzle) onSolvePuzzle();
          } else {
            soundManager.playDefeat();
            setFailed(true);
            setTimeout(() => {
              chess.load(dailyPuzzle.fen);
              setFen(chess.fen());
              setFailed(false);
            }, 1000);
          }
        } else {
          soundManager.playVictory();
          setSolved(true);
        }
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  };

  const handleRetry = () => {
    if (activeTab === "daily" && dailyPuzzle) {
      chess.load(dailyPuzzle.fen);
      setFen(chess.fen());
      setSolved(false);
      setFailed(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Puzzles</Text>
        </Pressable>

        <View style={styles.tabToggle}>
          <Pressable
            onPress={() => setActiveTab("daily")}
            style={[styles.tabBtn, activeTab === "daily" && styles.activeTabBtn]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "daily" && styles.activeTabBtnText,
              ]}
            >
              Daily
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("tactics")}
            style={[styles.tabBtn, activeTab === "tactics" && styles.activeTabBtn]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "tactics" && styles.activeTabBtnText,
              ]}
            >
              Themes
            </Text>
          </Pressable>
        </View>

        <View style={styles.streakBadge}>
          <Flame size={12} color={GOLD[300]} />
          <Text style={styles.streakText}>{dailyStreak}d</Text>
        </View>
      </View>

      {/* ═══ Daily Puzzle ═══ */}
      {activeTab === "daily" && dailyPuzzle && (
        <View style={styles.puzzleLayout}>
          {/* Puzzle Info Card */}
          <View style={styles.puzzleInfoCard}>
            <View style={styles.puzzleInfoTopRow}>
              <View style={styles.puzzleIconBox}>
                <Crown size={18} color={GOLD[300]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.puzzleTitle}>{dailyPuzzle.description}</Text>
                <Text style={styles.puzzleMeta}>
                  Rating: {dailyPuzzle.rating} • Theme: {dailyPuzzle.theme.toUpperCase()}
                </Text>
              </View>
            </View>

            {failed && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>Incorrect move! Try again.</Text>
              </View>
            )}

            {solved && (
              <View style={styles.successBox}>
                <CheckCircle2 size={20} color="#34D399" />
                <Text style={styles.successText}>Puzzle Solved! (+15 Rating)</Text>
              </View>
            )}

            {showHint && !solved && (
              <View style={styles.hintBox}>
                <Lightbulb size={14} color="#FBBF24" />
                <Text style={styles.hintText}>
                  Look for tactical motifs targeting the king or hanging pieces.
                </Text>
              </View>
            )}

            <View style={styles.actionRow}>
              {!solved && (
                <Pressable onPress={() => setShowHint(true)} style={styles.hintBtn}>
                  <Lightbulb size={14} color={GOLD[300]} />
                  <Text style={styles.hintBtnText}>Hint</Text>
                </Pressable>
              )}
              <Pressable onPress={handleRetry} style={styles.retryBtn}>
                <RotateCcw size={14} color="#E4E4E7" />
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          </View>

          {/* Board */}
          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation={dailyPuzzle.theme === "back_rank" ? "b" : "w"}
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleMove}
              disabled={solved}
            />
          </View>
        </View>
      )}

      {/* ═══ Tactics Themes ═══ */}
      {activeTab === "tactics" && (
        <View style={styles.tacticsLayout}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeScroll}
          >
            {["mate_in_1", "mate_in_2", "fork", "pin", "skewer", "endgame"].map((t) => (
              <Pressable
                key={t}
                onPress={() => setSelectedTheme(t as PuzzleTheme)}
                style={[
                  styles.themeChip,
                  selectedTheme === t && styles.activeThemeChip,
                ]}
              >
                <Text
                  style={[
                    styles.themeText,
                    selectedTheme === t && styles.activeThemeText,
                  ]}
                >
                  {t.replace(/_/g, " ")}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation="w"
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleMove}
              disabled={solved}
            />
          </View>

          {solved && (
            <View style={styles.successBox}>
              <CheckCircle2 size={20} color="#34D399" />
              <Text style={styles.successText}>Tactical Motif Mastered!</Text>
            </View>
          )}
        </View>
      )}
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
  tabToggle: {
    flexDirection: "row",
    ...glassCardSubtle,
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeTabBtn: {
    backgroundColor: GOLD[300],
  },
  tabBtnText: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeTabBtnText: {
    color: "#000",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
  },
  // ═══ Daily Puzzle ═══
  puzzleLayout: {
    gap: 16,
  },
  puzzleInfoCard: {
    ...glassCard,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    ...premiumShadow,
  },
  puzzleInfoTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  puzzleIconBox: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  puzzleTitle: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
  },
  puzzleMeta: {
    color: "#71717A",
    fontSize: 10,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: "rgba(159, 18, 57, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
    padding: 10,
    borderRadius: 12,
  },
  errorText: {
    color: "#FDA4AF",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(6, 78, 59, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
    padding: 12,
    borderRadius: 12,
  },
  successText: {
    color: "#6EE7B7",
    fontSize: 12,
    fontWeight: "bold",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    padding: 10,
    borderRadius: 12,
  },
  hintText: {
    color: "#FBBF24",
    fontSize: 11,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  hintBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingVertical: 12,
    borderRadius: 14,
  },
  hintBtnText: {
    color: GOLD[300],
    fontSize: 11,
    fontWeight: "bold",
  },
  retryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...glassCardSubtle,
    borderRadius: 14,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: "#E4E4E7",
    fontSize: 11,
    fontWeight: "bold",
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  // ═══ Tactics ═══
  tacticsLayout: {
    gap: 16,
  },
  themeScroll: {
    marginBottom: 4,
  },
  themeChip: {
    ...glassCardSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeThemeChip: {
    backgroundColor: GOLD[300],
    borderColor: GOLD[300],
    borderWidth: 1.5,
  },
  themeText: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  activeThemeText: {
    color: "#000",
  },
});

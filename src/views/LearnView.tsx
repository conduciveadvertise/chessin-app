import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { GameSettings, UserProfile } from "../types/chess";
import { learningRepository } from "../repositories/LearningRepository";
import {
  LessonRecord,
  OpeningInfoExtended,
  MissionRecord,
  AchievementRecord,
} from "../types/learning";
import {
  BookOpen,
  ChevronLeft,
  Compass,
  Award,
  Trophy,
  Zap,
  CheckCircle,
  Crown,
  Target,
} from "lucide-react-native";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface LearnViewProps {
  user?: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  user,
  settings,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<"academy" | "explorer" | "missions">("academy");

  const [selectedLevel, setSelectedLevel] = useState<
    "beginner" | "intermediate" | "advanced" | "grandmaster"
  >("beginner");
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [chess] = useState<Chess>(() => new Chess());
  const [completedLesson, setCompletedLesson] = useState<boolean>(false);

  const [openings, setOpenings] = useState<OpeningInfoExtended[]>([]);
  const [selectedOpening, setSelectedOpening] = useState<OpeningInfoExtended | null>(null);

  const [missions, setMissions] = useState<MissionRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);

  useEffect(() => {
    learningRepository.getLessons(selectedLevel).then((data) => {
      setLessons(data);
      if (data.length > 0) {
        setActiveLessonIndex(0);
        chess.load(data[0].fen);
        setCompletedLesson(false);
      }
    });

    learningRepository.getOpeningExplorer().then((data) => {
      setOpenings(data);
      if (data.length > 0) setSelectedOpening(data[0]);
    });

    learningRepository.getMissions().then(setMissions);
    learningRepository.getAchievements().then(setAchievements);
  }, [selectedLevel, chess]);

  const handleLessonMove = (from: string, to: string) => {
    try {
      const moveObj = chess.move({ from, to, promotion: "q" });
      if (moveObj) {
        setCompletedLesson(true);
        soundManager.playVictory();
      }
    } catch (e) {
      console.log("Lesson move error", e);
    }
  };

  const activeLesson = lessons[activeLessonIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Academy</Text>
        </Pressable>

        <View style={styles.tabToggle}>
          <Pressable
            onPress={() => setActiveTab("academy")}
            style={[styles.tabBtn, activeTab === "academy" && styles.activeTabBtn]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "academy" && styles.activeTabBtnText,
              ]}
            >
              Lessons
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("explorer")}
            style={[styles.tabBtn, activeTab === "explorer" && styles.activeTabBtn]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "explorer" && styles.activeTabBtnText,
              ]}
            >
              Openings
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("missions")}
            style={[styles.tabBtn, activeTab === "missions" && styles.activeTabBtn]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "missions" && styles.activeTabBtnText,
              ]}
            >
              Missions
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ═══ Academy Lessons ═══ */}
      {activeTab === "academy" && (
        <View style={styles.layout}>
          {/* Level selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.levelScroll}
          >
            {(["beginner", "intermediate", "advanced", "grandmaster"] as const).map(
              (lvl) => (
                <Pressable
                  key={lvl}
                  onPress={() => setSelectedLevel(lvl)}
                  style={[
                    styles.levelChip,
                    selectedLevel === lvl && styles.activeLevelChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelText,
                      selectedLevel === lvl && styles.activeLevelText,
                    ]}
                  >
                    {lvl}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>

          {activeLesson && (
            <View style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <View style={styles.lessonIconBox}>
                  <BookOpen size={18} color={GOLD[300]} />
                </View>
                <Text style={styles.lessonTitle}>{activeLesson.title}</Text>
              </View>
              <Text style={styles.lessonBody}>{activeLesson.explanation}</Text>

              {completedLesson && (
                <View style={styles.successBox}>
                  <CheckCircle size={16} color="#34D399" />
                  <Text style={styles.successText}>
                    Lesson Completed! +{activeLesson.xpReward} XP
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation="w"
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleLessonMove}
            />
          </View>
        </View>
      )}

      {/* ═══ Opening Explorer ═══ */}
      {activeTab === "explorer" && (
        <View style={styles.layout}>
          {openings.map((op) => (
            <Pressable
              key={op.id}
              onPress={() => setSelectedOpening(op)}
              style={[
                styles.openingCard,
                selectedOpening?.id === op.id && styles.activeOpeningCard,
              ]}
            >
              <View style={styles.openingHeader}>
                <View style={styles.openingIconBox}>
                  <Compass size={14} color={GOLD[300]} />
                </View>
                <Text style={styles.openingEco}>{op.eco}</Text>
              </View>
              <Text style={styles.openingName}>{op.name}</Text>
              <Text style={styles.openingPgn}>{op.pgnMoves}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ═══ Missions ═══ */}
      {activeTab === "missions" && (
        <View style={styles.layout}>
          <View style={styles.missionHeaderRow}>
            <View style={styles.missionIconBox}>
              <Target size={18} color={GOLD[300]} />
            </View>
            <Text style={styles.sectionTitle}>Daily Missions</Text>
          </View>

          {missions.map((m) => (
            <View key={m.id} style={styles.missionCard}>
              <View style={styles.missionIconSmall}>
                <Zap size={16} color={GOLD[300]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.missionTitle}>{m.title}</Text>
                <Text style={styles.missionBody}>{m.description}</Text>
              </View>
              <View style={styles.missionXpBox}>
                <Text style={styles.missionXp}>+{m.xpReward}</Text>
                <Text style={styles.missionXpLabel}>XP</Text>
              </View>
            </View>
          ))}
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
  layout: {
    gap: 12,
  },
  // ═══ Academy ═══
  levelScroll: {
    marginBottom: 4,
  },
  levelChip: {
    ...glassCardSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 6,
  },
  activeLevelChip: {
    backgroundColor: GOLD[300],
    borderColor: GOLD[300],
    borderWidth: 1.5,
  },
  levelText: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  activeLevelText: {
    color: "#000",
  },
  lessonCard: {
    ...glassCard,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    ...premiumShadow,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lessonIconBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  lessonTitle: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  lessonBody: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(6, 78, 59, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  successText: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "bold",
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  // ═══ Opening Explorer ═══
  openingCard: {
    ...glassCardSubtle,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  activeOpeningCard: {
    borderColor: GOLD[300],
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1.5,
  },
  openingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  openingIconBox: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  openingEco: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  openingName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  openingPgn: {
    color: "#71717A",
    fontSize: 11,
  },
  // ═══ Missions ═══
  missionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  missionIconBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  sectionTitle: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...glassCardSubtle,
    borderRadius: 16,
    padding: 14,
  },
  missionIconSmall: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  missionTitle: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  missionBody: {
    color: "#71717A",
    fontSize: 10,
    marginTop: 2,
  },
  missionXpBox: {
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  missionXp: {
    color: GOLD[300],
    fontSize: 14,
    fontWeight: "bold",
  },
  missionXpLabel: {
    color: "#52525B",
    fontSize: 8,
    fontWeight: "bold",
  },
});

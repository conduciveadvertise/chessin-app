import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import {
  Bot,
  Swords,
  Puzzle,
  BookOpen,
  Trophy,
  Crown,
  Users,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap,
  Target,
} from "lucide-react-native";
import { GameMode, UserProfile } from "../types/chess";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface HomeViewProps {
  onSelectMode: (mode: GameMode | "leaderboard" | "profile" | "tournaments") => void;
  user: UserProfile;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectMode, user }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ═══ Hero Banner ═══ */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <View style={styles.circuitBadge}>
          <Crown size={12} color={GOLD[300]} />
          <Text style={styles.circuitBadgeText}>
            EDITORIAL CIRCUIT • INDIA'S PREMIER ARENA
          </Text>
        </View>

        <Text style={styles.heroTitle}>The Grandmaster</Text>
        <Text style={styles.heroTitleSub}>Invitational & Arena</Text>

        <Text style={styles.heroBody}>
          Experience ultra-responsive grandmaster chess with FIDE rules, Stockfish 17
          AI, Gemini Coach, and real-time multiplayer.
        </Text>

        <View style={styles.ctaRow}>
          <Pressable onPress={() => onSelectMode("vs_ai")} style={styles.primaryCta}>
            <Bot size={16} color="#000" />
            <Text style={styles.primaryCtaText}>Play Stockfish AI</Text>
            <ArrowRight size={14} color="#000" />
          </Pressable>

          <Pressable onPress={() => onSelectMode("online")} style={styles.secondaryCta}>
            <Swords size={16} color={GOLD[300]} />
            <Text style={styles.secondaryCtaText}>Online Arena</Text>
          </Pressable>
        </View>
      </View>

      {/* ═══ Stats Strip ═══ */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.rating.rapid}</Text>
          <Text style={styles.statLabel}>Rapid ELO</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.winCount}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.dailyStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.rating.puzzle}</Text>
          <Text style={styles.statLabel}>Puzzle</Text>
        </View>
      </View>

      {/* ═══ Featured Modes ═══ */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={18} color={GOLD[300]} />
          <Text style={styles.sectionTitle}>Featured Modes</Text>
        </View>
        <Text style={styles.sectionMeta}>CHESS.IN v2.4 PRO</Text>
      </View>

      <View style={styles.grid}>
        {/* vs AI */}
        <Pressable onPress={() => onSelectMode("vs_ai")} style={styles.featureCard}>
          <View style={styles.featureTopRow}>
            <View style={styles.iconBoxGold}>
              <Bot size={22} color={GOLD[300]} />
            </View>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>AI</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Stockfish Engine</Text>
          <Text style={styles.cardBody}>
            6 difficulty tiers from Beginner (400 ELO) to Stockfish GM (2800 ELO).
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>PLAY AI</Text>
            <ArrowRight size={12} color={GOLD[300]} />
          </View>
        </Pressable>

        {/* Online */}
        <Pressable onPress={() => onSelectMode("online")} style={styles.featureCard}>
          <View style={styles.featureTopRow}>
            <View style={styles.iconBoxGold}>
              <Swords size={22} color={GOLD[300]} />
            </View>
            <View style={[styles.featureBadge, styles.featureBadgeLive]}>
              <Text style={styles.featureBadgeText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Online Multiplayer</Text>
          <Text style={styles.cardBody}>
            Challenge players nationwide via custom invitation codes or rating lobbies.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>JOIN LOBBY</Text>
            <ArrowRight size={12} color={GOLD[300]} />
          </View>
        </Pressable>

        {/* Puzzle */}
        <Pressable onPress={() => onSelectMode("puzzle")} style={styles.featureCard}>
          <View style={styles.featureTopRow}>
            <View style={styles.iconBoxGold}>
              <Puzzle size={22} color={GOLD[300]} />
            </View>
            <View style={[styles.featureBadge, styles.featureBadgeNew]}>
              <Text style={styles.featureBadgeText}>+15 ELO</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Daily Puzzles</Text>
          <Text style={styles.cardBody}>
            Sharpen tactical vision with curated FIDE mate puzzles and earn +15 ELO.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>SOLVE PUZZLE</Text>
            <ArrowRight size={12} color={GOLD[300]} />
          </View>
        </Pressable>

        {/* Pass & Play */}
        <Pressable onPress={() => onSelectMode("pass_and_play")} style={styles.featureCard}>
          <View style={styles.featureTopRow}>
            <View style={styles.iconBoxGold}>
              <Users size={22} color={GOLD[300]} />
            </View>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>LOCAL</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Pass & Play</Text>
          <Text style={styles.cardBody}>
            Play face-to-face on 1 device with move history & board flip.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>START OFFLINE</Text>
            <ArrowRight size={12} color={GOLD[300]} />
          </View>
        </Pressable>
      </View>

      {/* ═══ Secondary Cards ═══ */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Zap size={18} color={GOLD[300]} />
          <Text style={styles.sectionTitle}>Explore More</Text>
        </View>
      </View>

      <View style={styles.secondaryGrid}>
        <Pressable onPress={() => onSelectMode("learn")} style={styles.subCard}>
          <View style={styles.subIconBox}>
            <BookOpen size={20} color={GOLD[300]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Interactive Academy</Text>
            <Text style={styles.subBody}>Master rules, principles & endgame traps.</Text>
          </View>
          <ArrowRight size={14} color="#52525B" />
        </Pressable>

        <Pressable onPress={() => onSelectMode("analysis")} style={styles.subCard}>
          <View style={styles.subIconBox}>
            <BarChart3 size={20} color={GOLD[300]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Analysis Board</Text>
            <Text style={styles.subBody}>
              Paste FEN/PGN for infinite depth engine evaluation.
            </Text>
          </View>
          <ArrowRight size={14} color="#52525B" />
        </Pressable>

        <Pressable onPress={() => onSelectMode("leaderboard")} style={styles.subCard}>
          <View style={styles.subIconBox}>
            <Trophy size={20} color={GOLD[300]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>National Circuit</Text>
            <Text style={styles.subBody}>View top Indian Grandmasters & ratings.</Text>
          </View>
          <ArrowRight size={14} color="#52525B" />
        </Pressable>

        <Pressable onPress={() => onSelectMode("tournaments")} style={styles.goldSubCard}>
          <View style={styles.goldSubIconBox}>
            <Target size={20} color="#FDE68A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goldSubTitle}>Tournament Arena</Text>
            <Text style={styles.goldSubBody}>
              Arena & Swiss cash tournaments with instant pairings.
            </Text>
          </View>
          <ArrowRight size={14} color={GOLD[300]} />
        </Pressable>
      </View>
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
    gap: 20,
  },
  // ═══ Hero ═══
  heroCard: {
    ...glassCard,
    borderRadius: 28,
    padding: 24,
    gap: 10,
    overflow: "hidden",
  position: "relative",
  ...premiumShadow,
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(212, 175, 55, 0.06)",
  },
  circuitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  circuitBadgeText: {
    color: GOLD[300],
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  heroTitleSub: {
    color: GOLD[300],
    fontSize: 26,
    fontWeight: "normal",
    fontStyle: "italic",
    marginTop: -6,
  },
  heroBody: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GOLD[300],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    ...premiumShadow,
  },
  primaryCtaText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  secondaryCtaText: {
    color: GOLD[300],
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  // ═══ Stats Strip ═══
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    ...glassCardSubtle,
    borderRadius: 18,
    paddingVertical: 14,
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    color: GOLD[300],
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  // ═══ Section Header ═══
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.1)",
    paddingBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionMeta: {
    color: GOLD[300],
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // ═══ Feature Grid ═══
  grid: {
    gap: 12,
  },
  featureCard: {
    ...glassCard,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  featureTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBoxGold: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    alignSelf: "flex-start",
  },
  featureBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureBadgeLive: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderColor: "rgba(52, 211, 153, 0.25)",
  },
  featureBadgeNew: {
    backgroundColor: "rgba(168, 85, 247, 0.12)",
    borderColor: "rgba(168, 85, 247, 0.25)",
  },
  featureBadgeText: {
    color: GOLD[300],
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardBody: {
    color: "#A1A1AA",
    fontSize: 11,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  cardFooterText: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // ═══ Secondary Grid ═══
  secondaryGrid: {
    gap: 10,
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...glassCardSubtle,
    borderRadius: 18,
    padding: 14,
  },
  subIconBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  subTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  subBody: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  goldSubCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 18,
    padding: 14,
  },
  goldSubIconBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  goldSubTitle: {
    color: "#FDE68A",
    fontSize: 14,
    fontWeight: "bold",
  },
  goldSubBody: {
    color: "#D4D4D8",
    fontSize: 11,
    marginTop: 2,
  },
});

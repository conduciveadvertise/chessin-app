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
  Shield,
  BarChart3,
} from "lucide-react-native";
import { GameMode, UserProfile } from "../types/chess";

interface HomeViewProps {
  onSelectMode: (mode: GameMode | "leaderboard" | "profile" | "tournaments" | "admin") => void;
  user: UserProfile;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectMode, user }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.circuitBadge}>
          <Crown size={12} color="#D4AF37" />
          <Text style={styles.circuitBadgeText}>EDITORIAL CIRCUIT • INDIA'S PREMIER ARENA</Text>
        </View>

        <Text style={styles.heroTitle}>The Grandmaster</Text>
        <Text style={styles.heroTitleSub}>Invitational & Arena</Text>

        <Text style={styles.heroBody}>
          Experience ultra-responsive grandmaster chess with FIDE rules, Stockfish 16 AI, Gemini
          Coach, and real-time multiplayer.
        </Text>

        {/* CTA Buttons */}
        <View style={styles.ctaRow}>
          <Pressable onPress={() => onSelectMode("vs_ai")} style={styles.primaryCta}>
            <Bot size={16} color="#000" />
            <Text style={styles.primaryCtaText}>Play Stockfish AI</Text>
            <ArrowRight size={14} color="#000" />
          </Pressable>

          <Pressable onPress={() => onSelectMode("online")} style={styles.secondaryCta}>
            <Swords size={16} color="#D4AF37" />
            <Text style={styles.secondaryCtaText}>Online Arena</Text>
          </Pressable>
        </View>
      </View>

      {/* Featured Modes Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={18} color="#D4AF37" />
          <Text style={styles.sectionTitle}>Featured Modes</Text>
        </View>
        <Text style={styles.sectionMeta}>CHESS.IN v2.4 PRO</Text>
      </View>

      <View style={styles.grid}>
        {/* Play vs AI */}
        <Pressable onPress={() => onSelectMode("vs_ai")} style={styles.featureCard}>
          <View style={styles.iconBox}>
            <Bot size={22} color="#D4AF37" />
          </View>
          <Text style={styles.cardTitle}>Stockfish Engine</Text>
          <Text style={styles.cardBody}>
            6 difficulty tiers from Beginner (400 ELO) to Stockfish GM (2800 ELO).
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>PLAY AI</Text>
            <ArrowRight size={12} color="#D4AF37" />
          </View>
        </Pressable>

        {/* Online Multiplayer */}
        <Pressable onPress={() => onSelectMode("online")} style={styles.featureCard}>
          <View style={styles.iconBox}>
            <Swords size={22} color="#D4AF37" />
          </View>
          <Text style={styles.cardTitle}>Online Multiplayer</Text>
          <Text style={styles.cardBody}>
            Challenge players nationwide via custom invitation codes or rating lobbies.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>JOIN LOBBY</Text>
            <ArrowRight size={12} color="#D4AF37" />
          </View>
        </Pressable>

        {/* Daily Puzzle */}
        <Pressable onPress={() => onSelectMode("puzzle")} style={styles.featureCard}>
          <View style={styles.iconBox}>
            <Puzzle size={22} color="#D4AF37" />
          </View>
          <Text style={styles.cardTitle}>Daily Puzzles</Text>
          <Text style={styles.cardBody}>
            Sharpen tactical vision with curated FIDE mate puzzles and earn +15 ELO.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>SOLVE PUZZLE</Text>
            <ArrowRight size={12} color="#D4AF37" />
          </View>
        </Pressable>

        {/* Pass & Play */}
        <Pressable onPress={() => onSelectMode("pass_and_play")} style={styles.featureCard}>
          <View style={styles.iconBox}>
            <Users size={22} color="#D4AF37" />
          </View>
          <Text style={styles.cardTitle}>Pass & Play</Text>
          <Text style={styles.cardBody}>
            Play face-to-face on 1 device with move history & board flip.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>START OFFLINE</Text>
            <ArrowRight size={12} color="#D4AF37" />
          </View>
        </Pressable>
      </View>

      {/* Secondary Row */}
      <View style={styles.secondaryGrid}>
        <Pressable onPress={() => onSelectMode("learn")} style={styles.subCard}>
          <View style={styles.subIconBox}>
            <BookOpen size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Interactive Academy</Text>
            <Text style={styles.subBody}>Master rules, principles & endgame traps.</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => onSelectMode("analysis")} style={styles.subCard}>
          <View style={styles.subIconBox}>
            <BarChart3 size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Analysis Board</Text>
            <Text style={styles.subBody}>Paste FEN/PGN for infinite depth engine evaluation.</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => onSelectMode("leaderboard")} style={styles.subCard}>
          <View style={styles.subIconBox}>
            <Trophy size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>National Circuit</Text>
            <Text style={styles.subBody}>View top Indian Grandmasters & ratings.</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => onSelectMode("tournaments")} style={styles.goldSubCard}>
          <View style={styles.goldSubIconBox}>
            <Trophy size={20} color="#FDE68A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goldSubTitle}>Tournament Arena</Text>
            <Text style={styles.goldSubBody}>
              Arena & Swiss cash tournaments with instant pairings.
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={() => onSelectMode("admin")} style={styles.roseSubCard}>
          <View style={styles.roseSubIconBox}>
            <Shield size={20} color="#F87171" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roseSubTitle}>Admin Moderation</Text>
            <Text style={styles.roseSubBody}>
              Fair play anti-cheat queue & system announcements.
            </Text>
          </View>
        </Pressable>
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
    gap: 20,
  },
  heroCard: {
    backgroundColor: "#0A0A0C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    gap: 10,
  },
  circuitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  circuitBadgeText: {
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
  },
  heroTitleSub: {
    color: "#D4AF37",
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
    marginTop: 8,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  secondaryCtaText: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
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
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
  },
  grid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  iconBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    alignSelf: "flex-start",
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
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  cardFooterText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  secondaryGrid: {
    gap: 10,
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: 14,
  },
  subIconBox: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
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
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 18,
    padding: 14,
  },
  goldSubIconBox: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
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
  roseSubCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(159, 18, 57, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
    borderRadius: 18,
    padding: 14,
  },
  roseSubIconBox: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(244, 63, 94, 0.2)",
  },
  roseSubTitle: {
    color: "#FDA4AF",
    fontSize: 14,
    fontWeight: "bold",
  },
  roseSubBody: {
    color: "#E4E4E7",
    fontSize: 11,
    marginTop: 2,
  },
});

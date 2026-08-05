import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { tournamentRepository } from "../repositories/TournamentRepository";
import { Tournament, TournamentPlayer } from "../types/tournament";
import { UserProfile, GameSettings } from "../types/chess";
import { Trophy, ChevronLeft, Users, Clock, Crown, Zap } from "lucide-react-native";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface TournamentViewProps {
  user: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  user,
  settings,
  onBackToHome,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTourn, setSelectedTourn] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);

  useEffect(() => {
    tournamentRepository.getTournaments().then(setTournaments);
  }, []);

  useEffect(() => {
    if (selectedTourn) {
      tournamentRepository.getTournamentPlayers(selectedTourn.id).then(setPlayers);
    }
  }, [selectedTourn]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Home</Text>
        </Pressable>

        <View style={styles.badge}>
          <Trophy size={14} color={GOLD[300]} />
          <Text style={styles.badgeText}>Tournaments</Text>
        </View>
      </View>

      {!selectedTourn ? (
        <View style={styles.layout}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconBox}>
              <Crown size={18} color={GOLD[300]} />
            </View>
            <Text style={styles.title}>Tournament Arena</Text>
          </View>

          {tournaments.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setSelectedTourn(t)}
              style={styles.tournCard}
            >
              <View style={styles.tournHeader}>
                <View style={styles.tournTypeBadge}>
                  <Zap size={10} color={GOLD[300]} />
                  <Text style={styles.tournType}>{t.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.tournPrize}>₹{t.prizePool} INR</Text>
              </View>
              <Text style={styles.tournTitle}>{t.title}</Text>
              <View style={styles.tournMeta}>
                <View style={styles.metaItem}>
                  <Users size={12} color={GOLD[300]} />
                  <Text style={styles.metaText}>
                    {t.playerCount} / {t.maxPlayers}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color={GOLD[300]} />
                  <Text style={styles.metaText}>{t.durationMins}m</Text>
                </View>
                <View style={styles.joinCta}>
                  <Text style={styles.joinCtaText}>JOIN</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.layout}>
          <Pressable
            onPress={() => setSelectedTourn(null)}
            style={styles.backLink}
          >
            <ChevronLeft size={14} color={GOLD[300]} />
            <Text style={styles.backLinkText}>Back to Arena</Text>
          </Pressable>

          <View style={styles.detailHeader}>
            <Text style={styles.tournTitle}>{selectedTourn.title}</Text>
            <Text style={styles.sectionTitle}>Standings</Text>
          </View>

          {players.map((p, idx) => (
            <View
              key={p.id}
              style={[styles.playerRow, idx === 0 && styles.playerRowTop]}
            >
              <View style={styles.playerRankBox}>
                {idx < 3 ? (
                  <Crown size={14} color={GOLD[300]} />
                ) : null}
                <Text style={styles.playerRank}>#{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{p.userName}</Text>
                <Text style={styles.playerRating}>{p.userRating} ELO</Text>
              </View>
              <View style={styles.playerScoreBox}>
                <Text style={styles.playerScore}>{p.score}</Text>
                <Text style={styles.playerScoreLabel}>pts</Text>
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
  layout: {
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleIconBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  title: {
    color: GOLD[300],
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // ═══ Tournament Card ═══
  tournCard: {
    ...glassCard,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  tournHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tournTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tournType: {
    color: GOLD[300],
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tournPrize: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "bold",
  },
  tournTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  tournMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  joinCta: {
    marginLeft: "auto",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  joinCtaText: {
    color: GOLD[300],
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // ═══ Detail View ═══
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backLinkText: {
    color: GOLD[300],
    fontSize: 11,
    fontWeight: "bold",
  },
  detailHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // ═══ Player Row ═══
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    ...glassCardSubtle,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  playerRowTop: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  playerRankBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 50,
  },
  playerRank: {
    color: GOLD[300],
    fontSize: 12,
    fontWeight: "bold",
  },
  playerName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  playerRating: {
    color: "#71717A",
    fontSize: 10,
    marginTop: 1,
  },
  playerScoreBox: {
    alignItems: "center",
  },
  playerScore: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
  },
  playerScoreLabel: {
    color: "#52525B",
    fontSize: 8,
    fontWeight: "600",
  },
});

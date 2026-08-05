import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import { fetchLeaderboard } from "../services/api";
import { LeaderboardEntry } from "../types/chess";
import { Trophy, Crown, ChevronLeft, Search, Medal, Award } from "lucide-react-native";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface LeaderboardViewProps {
  onBackToHome: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBackToHome }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard);
  }, []);

  const filteredData = leaderboard.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredData.slice(0, 3);
  const restEntries = filteredData.slice(3);

  const podiumStyles = [
    { height: 90, color: GOLD[300], icon: Crown, label: "1st" },
    { height: 70, color: "#C0C0C0", icon: Medal, label: "2nd" },
    { height: 56, color: "#CD7F32", icon: Award, label: "3rd" },
  ];

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
          <Text style={styles.badgeText}>Leaderboard</Text>
        </View>
      </View>

      <Text style={styles.title}>National Leaderboard</Text>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search size={14} color="#71717A" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search player..."
          placeholderTextColor="#52525B"
          style={styles.searchInput}
        />
      </View>

      {/* ═══ Podium for Top 3 ═══ */}
      {top3.length >= 3 && (
        <View style={styles.podiumContainer}>
          {/* 2nd place */}
          <View style={styles.podiumColumn}>
            <Image source={{ uri: top3[1].avatar }} style={styles.podiumAvatar2} />
            <Text style={styles.podiumName}>{top3[1].name}</Text>
            <Text style={styles.podiumRating}>{top3[1].rating}</Text>
            <View style={[styles.podiumBlock, { height: 70, backgroundColor: "rgba(192,192,192,0.12)", borderColor: "rgba(192,192,192,0.3)" }]}>
              <Medal size={20} color="#C0C0C0" />
              <Text style={[styles.podiumRank, { color: "#C0C0C0" }]}>2</Text>
            </View>
          </View>

          {/* 1st place */}
          <View style={styles.podiumColumn}>
            <View style={styles.crownWrap}>
              <Crown size={18} color={GOLD[300]} />
            </View>
            <Image source={{ uri: top3[0].avatar }} style={styles.podiumAvatar1} />
            <Text style={styles.podiumName}>{top3[0].name}</Text>
            <Text style={styles.podiumRating}>{top3[0].rating}</Text>
            <View style={[styles.podiumBlock, { height: 90, backgroundColor: "rgba(212,175,55,0.12)", borderColor: "rgba(212,175,55,0.3)" }]}>
              <Crown size={22} color={GOLD[300]} />
              <Text style={[styles.podiumRank, { color: GOLD[300] }]}>1</Text>
            </View>
          </View>

          {/* 3rd place */}
          <View style={styles.podiumColumn}>
            <Image source={{ uri: top3[2].avatar }} style={styles.podiumAvatar3} />
            <Text style={styles.podiumName}>{top3[2].name}</Text>
            <Text style={styles.podiumRating}>{top3[2].rating}</Text>
            <View style={[styles.podiumBlock, { height: 56, backgroundColor: "rgba(205,127,50,0.12)", borderColor: "rgba(205,127,50,0.3)" }]}>
              <Award size={18} color="#CD7F32" />
              <Text style={[styles.podiumRank, { color: "#CD7F32" }]}>3</Text>
            </View>
          </View>
        </View>
      )}

      {/* ═══ Ranking Table ═══ */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>RANK</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>PLAYER</Text>
          <Text style={styles.tableHeaderText}>RATING</Text>
        </View>

        {restEntries.map((player) => (
          <View key={player.rank} style={styles.row}>
            <View style={styles.rankCol}>
              <Text style={styles.rankText}>#{player.rank}</Text>
            </View>
            <View style={styles.playerCol}>
              <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerMeta}>
                  {player.title} • {player.flag}
                </Text>
              </View>
            </View>
            <View style={styles.ratingCol}>
              <Text style={styles.ratingText}>{player.rating}</Text>
              <Text style={styles.winRateText}>{player.winRate}</Text>
            </View>
          </View>
        ))}
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
  title: {
    color: GOLD[300],
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // ═══ Search ═══
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...glassCardSubtle,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 12,
    paddingVertical: 0,
  },
  // ═══ Podium ═══
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    ...glassCard,
    borderRadius: 20,
    padding: 16,
    ...premiumShadow,
  },
  podiumColumn: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  crownWrap: {
    marginBottom: 2,
  },
  podiumAvatar1: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: GOLD[300],
  },
  podiumAvatar2: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#C0C0C0",
  },
  podiumAvatar3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#CD7F32",
  },
  podiumName: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 2,
  },
  podiumRating: {
    color: GOLD[300],
    fontSize: 12,
    fontWeight: "bold",
  },
  podiumBlock: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginTop: 4,
  },
  podiumRank: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // ═══ Table ═══
  table: {
    ...glassCard,
    borderRadius: 18,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.12)",
    backgroundColor: "rgba(212, 175, 55, 0.04)",
  },
  tableHeaderText: {
    color: GOLD[300],
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  rankCol: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "bold",
  },
  playerCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  playerName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  playerMeta: {
    color: "#71717A",
    fontSize: 10,
    marginTop: 1,
  },
  ratingCol: {
    alignItems: "flex-end",
  },
  ratingText: {
    color: GOLD[300],
    fontSize: 13,
    fontWeight: "bold",
  },
  winRateText: {
    color: "#34D399",
    fontSize: 10,
    marginTop: 1,
  },
});

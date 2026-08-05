import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Image } from "react-native";
import { fetchLeaderboard } from "../services/api";
import { LeaderboardEntry } from "../types/chess";
import { Trophy, Crown, ChevronLeft, Search } from "lucide-react-native";

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Home</Text>
        </Pressable>

        <View style={styles.badge}>
          <Trophy size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Leaderboard</Text>
        </View>
      </View>

      <Text style={styles.title}>National Leaderboard</Text>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search player..."
        placeholderTextColor="#71717A"
        style={styles.searchInput}
      />

      <View style={styles.table}>
        {filteredData.map((player) => (
          <View key={player.rank} style={styles.row}>
            <View style={styles.rankCol}>
              {player.rank === 1 ? (
                <Crown size={16} color="#FBBF24" />
              ) : (
                <Text style={styles.rankText}>#{player.rank}</Text>
              )}
            </View>

            <View style={styles.playerCol}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerMeta}>
                {player.title} • {player.flag}
              </Text>
            </View>

            <View style={styles.ratingCol}>
              <Text style={styles.ratingText}>{player.rating} ELO</Text>
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
  title: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#0A0A0C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 12,
  },
  table: {
    backgroundColor: "#0A0A0C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  rankCol: {
    width: 36,
    alignItems: "center",
  },
  rankText: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "bold",
  },
  playerCol: {
    flex: 1,
  },
  playerName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  playerMeta: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  ratingCol: {
    alignItems: "flex-end",
  },
  ratingText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  winRateText: {
    color: "#34D399",
    fontSize: 10,
  },
});

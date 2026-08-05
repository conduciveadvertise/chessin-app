import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import { UserProfile } from "../types/chess";
import { Award, Trophy, Flame, ChevronLeft, LogOut, KeyRound } from "lucide-react-native";
import { authService, useAuth } from "../services/authService";

interface ProfileViewProps {
  user: UserProfile;
  onBackToHome: () => void;
  onOpenAuth?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onBackToHome, onOpenAuth }) => {
  const { isAuthenticated, isGuest } = useAuth();
  const totalGames = user.winCount + user.lossCount + user.drawCount;
  const winPercent = totalGames > 0 ? Math.round((user.winCount / totalGames) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Home</Text>
        </Pressable>

        <View style={styles.authBtnWrap}>
          {isAuthenticated ? (
            <Pressable onPress={() => authService.signOut()} style={styles.signOutBtn}>
              <LogOut size={14} color="#FDA4AF" />
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </Pressable>
          ) : (
            onOpenAuth && (
              <Pressable onPress={onOpenAuth} style={styles.signInBtn}>
                <KeyRound size={14} color="#000" />
                <Text style={styles.signInBtnText}>Sign In</Text>
              </Pressable>
            )
          )}
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.titleBadge}>{user.title}</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userMeta}>{user.country} • {winPercent}% Win Rate</Text>
        </View>
      </View>

      {/* Ratings */}
      <Text style={styles.sectionTitle}>Ratings</Text>
      <View style={styles.ratingsGrid}>
        {[
          { label: "Rapid", val: user.rating.rapid },
          { label: "Blitz", val: user.rating.blitz },
          { label: "Bullet", val: user.rating.bullet },
          { label: "Puzzle", val: user.rating.puzzle },
        ].map((item) => (
          <View key={item.label} style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>{item.label}</Text>
            <Text style={styles.ratingVal}>{item.val}</Text>
          </View>
        ))}
      </View>

      {/* Trophies */}
      <Text style={styles.sectionTitle}>Trophies</Text>
      <View style={styles.trophyCard}>
        <View style={styles.trophyItem}>
          <Award size={24} color="#D4AF37" />
          <Text style={styles.trophyTitle}>Grandmaster Master</Text>
        </View>
        <View style={styles.trophyItem}>
          <Flame size={24} color="#D4AF37" />
          <Text style={styles.trophyTitle}>5-Day Warrior</Text>
        </View>
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
  authBtnWrap: {},
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(159, 18, 57, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  signOutBtnText: {
    color: "#FDA4AF",
    fontSize: 11,
    fontWeight: "bold",
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  signInBtnText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#0A0A0C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  titleBadge: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  userName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userMeta: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  ratingBox: {
    flex: 1,
    backgroundColor: "#0A0A0C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  ratingLabel: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  ratingVal: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  trophyCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#0A0A0C",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  trophyItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  trophyTitle: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
});

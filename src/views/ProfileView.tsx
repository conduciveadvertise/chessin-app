import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import { UserProfile } from "../types/chess";
import {
  Award,
  Trophy,
  Flame,
  ChevronLeft,
  LogOut,
  KeyRound,
  Crown,
  Target,
  Zap,
} from "lucide-react-native";
import { authService, useAuth } from "../services/authService";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface ProfileViewProps {
  user: UserProfile;
  onBackToHome: () => void;
  onOpenAuth?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onBackToHome,
  onOpenAuth,
}) => {
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

      {/* ═══ Guest Sign-In Prompt ═══ */}
      {isGuest && (
        <View style={styles.guestPromptCard}>
          <View style={styles.guestIconBox}>
            <Crown size={24} color={GOLD[300]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guestTitle}>Playing as Guest</Text>
            <Text style={styles.guestBody}>
              Sign in to save your progress, ratings, and game history across devices.
            </Text>
          </View>
          {onOpenAuth && (
            <Pressable onPress={onOpenAuth} style={styles.guestSignInBtn}>
              <Text style={styles.guestSignInBtnText}>Sign In</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ═══ Main Profile Card ═══ */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.avatarRing} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.titleBadge}>{user.title}</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userMeta}>
            {user.country} • {winPercent}% Win Rate
          </Text>
        </View>
      </View>

      {/* ═══ Ratings Grid ═══ */}
      <Text style={styles.sectionTitle}>Ratings</Text>
      <View style={styles.ratingsGrid}>
        {[
          { label: "Rapid", val: user.rating.rapid, icon: Zap },
          { label: "Blitz", val: user.rating.blitz, icon: Flame },
          { label: "Bullet", val: user.rating.bullet, icon: Target },
          { label: "Puzzle", val: user.rating.puzzle, icon: Crown },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.label} style={styles.ratingBox}>
              <Icon size={14} color={GOLD[300]} />
              <Text style={styles.ratingLabel}>{item.label}</Text>
              <Text style={styles.ratingVal}>{item.val}</Text>
            </View>
          );
        })}
      </View>

      {/* ═══ Game Stats ═══ */}
      <Text style={styles.sectionTitle}>Game Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValueWin}>{user.winCount}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValueDraw}>{user.drawCount}</Text>
          <Text style={styles.statLabel}>Draws</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValueLoss}>{user.lossCount}</Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValueTotal}>{totalGames}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* ═══ Trophies ═══ */}
      <Text style={styles.sectionTitle}>Trophies</Text>
      <View style={styles.trophyCard}>
        <View style={styles.trophyItem}>
          <View style={styles.trophyIconBox}>
            <Award size={26} color={GOLD[300]} />
          </View>
          <Text style={styles.trophyTitle}>Grandmaster Master</Text>
        </View>
        <View style={styles.trophyDivider} />
        <View style={styles.trophyItem}>
          <View style={styles.trophyIconBox}>
            <Flame size={26} color={GOLD[300]} />
          </View>
          <Text style={styles.trophyTitle}>5-Day Warrior</Text>
        </View>
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
  authBtnWrap: {},
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(159, 18, 57, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
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
    backgroundColor: GOLD[300],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...premiumShadow,
  },
  signInBtnText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
  },
  // ═══ Guest Prompt ═══
  guestPromptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...glassCard,
    borderRadius: 18,
    padding: 14,
    borderColor: "rgba(212, 175, 55, 0.25)",
  },
  guestIconBox: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  guestTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  guestBody: {
    color: "#A1A1AA",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  guestSignInBtn: {
    backgroundColor: GOLD[300],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  guestSignInBtnText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
  },
  // ═══ Profile Card ═══
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...glassCard,
    borderRadius: 22,
    padding: 18,
    ...premiumShadow,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: GOLD[300],
  },
  avatarRing: {
    position: "absolute",
    top: -3,
    left: -3,
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  titleBadge: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  userName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  userMeta: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  // ═══ Section Title ═══
  sectionTitle: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // ═══ Ratings Grid ═══
  ratingsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  ratingBox: {
    flex: 1,
    ...glassCardSubtle,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  ratingLabel: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  ratingVal: {
    color: GOLD[300],
    fontSize: 18,
    fontWeight: "bold",
  },
  // ═══ Game Stats ═══
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    ...glassCardSubtle,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValueWin: {
    color: "#34D399",
    fontSize: 20,
    fontWeight: "bold",
  },
  statValueDraw: {
    color: "#A1A1AA",
    fontSize: 20,
    fontWeight: "bold",
  },
  statValueLoss: {
    color: "#F87171",
    fontSize: 20,
    fontWeight: "bold",
  },
  statValueTotal: {
    color: GOLD[300],
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  // ═══ Trophies ═══
  trophyCard: {
    flexDirection: "row",
    alignItems: "center",
    ...glassCard,
    borderRadius: 18,
    padding: 18,
  },
  trophyItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  trophyIconBox: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  trophyTitle: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  trophyDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});

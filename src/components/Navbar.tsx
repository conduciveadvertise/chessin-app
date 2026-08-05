import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import {
  Crown,
  Flame,
  Settings,
  User,
  Trophy,
  BookOpen,
  Swords,
  Bot,
  Puzzle,
  BarChart3,
  Home,
  Users,
  Menu,
  X,
  Bell,
  Sparkles,
  Award,
  ChevronRight,
} from "lucide-react-native";
import { GameMode, UserProfile } from "../types/chess";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface NavbarProps {
  currentMode: GameMode | "home" | "leaderboard" | "profile" | "tournaments";
  onSelectMode: (mode: any) => void;
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenAuth?: () => void;
  onOpenSocial?: () => void;
  unreadSocialCount?: number;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  user,
  onOpenSettings,
  onOpenAuth,
  onOpenSocial,
  unreadSocialCount = 0,
  isAuthenticated,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState<boolean>(false);

  const handleNavClick = (mode: any) => {
    onSelectMode(mode);
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const handleSocialClick = () => {
    if (onOpenSocial) onOpenSocial();
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      onSelectMode("profile");
    } else if (onOpenAuth) {
      onOpenAuth();
    }
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const playModesActive =
    ["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen;

  return (
    <>
      {/* Top Bar Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => handleNavClick("home")} style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Crown size={18} color="#000" />
            </View>
            <View>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandText}>CHESS.IN</Text>
                <View style={styles.proPill}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              </View>
            </View>
          </Pressable>

          <View style={styles.headerActions}>
            <View style={styles.streakBadge}>
              <Flame size={12} color={GOLD[300]} />
              <Text style={styles.streakText}>{user.dailyStreak}d</Text>
            </View>

            <Pressable onPress={handleAuthClick} style={styles.profileBtn}>
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            </Pressable>

            {Boolean(onOpenSocial) && (
              <Pressable onPress={handleSocialClick} style={styles.iconBtn}>
                <Users size={16} color="#D4D4D8" />
                {unreadSocialCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unreadSocialCount}</Text>
                  </View>
                )}
              </Pressable>
            )}

            <Pressable onPress={() => setIsDrawerOpen(true)} style={styles.menuBtn}>
              <Menu size={18} color={GOLD[300]} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavInner}>
          <Pressable onPress={() => handleNavClick("home")} style={styles.bottomTab}>
            <Home size={20} color={currentMode === "home" ? GOLD[300] : "#71717A"} />
            <Text style={[styles.bottomTabText, currentMode === "home" && styles.activeBottomText]}>Home</Text>
            {currentMode === "home" && <View style={styles.activeIndicator} />}
          </Pressable>

          <Pressable onPress={() => setIsPlayMenuOpen(!isPlayMenuOpen)} style={styles.bottomTab}>
            <Swords size={20} color={playModesActive ? GOLD[300] : "#71717A"} />
            <Text style={[styles.bottomTabText, playModesActive && styles.activeBottomText]}>Play</Text>
            {playModesActive && <View style={styles.activeIndicator} />}
          </Pressable>

          <Pressable onPress={handleSocialClick} style={styles.bottomTab}>
            <View style={{ position: "relative", alignItems: "center" }}>
              <Users size={20} color="#71717A" />
              {unreadSocialCount > 0 && (
                <View style={styles.bottomUnreadDot}>
                  <Text style={styles.bottomUnreadText}>{unreadSocialCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.bottomTabText}>Social</Text>
          </Pressable>

          <Pressable onPress={() => setIsDrawerOpen(true)} style={styles.bottomTab}>
            <Menu size={20} color="#71717A" />
            <Text style={styles.bottomTabText}>More</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={isPlayMenuOpen} transparent animationType="fade">
        <Pressable style={styles.playOverlay} onPress={() => setIsPlayMenuOpen(false)}>
          <View style={styles.playCard}>
            <View style={styles.playHeader}>
              <View style={styles.playHeaderTitleRow}>
                <Swords size={16} color={GOLD[300]} />
                <Text style={styles.playHeaderTitle}>Select Game Mode</Text>
              </View>
              <Pressable onPress={() => setIsPlayMenuOpen(false)} style={styles.closeIconBtn}>
                <X size={16} color="#A1A1AA" />
              </Pressable>
            </View>

            <Pressable onPress={() => handleNavClick("online")} style={styles.playOptionGold}>
              <View style={styles.playOptionIconBoxGold}>
                <Swords size={16} color="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Play Online</Text>
                <Text style={styles.playOptionSub}>Live Matchmaking & Rated Speed Chess</Text>
              </View>
              <ChevronRight size={16} color={GOLD[300]} />
            </Pressable>

            <Pressable onPress={() => handleNavClick("vs_ai")} style={styles.playOptionDark}>
              <View style={styles.playOptionIconBoxGreen}>
                <Bot size={16} color="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Play vs Stockfish AI</Text>
                <Text style={styles.playOptionSub}>Adaptive Levels & Grandmaster Bots</Text>
              </View>
              <ChevronRight size={16} color="#A1A1AA" />
            </Pressable>

            <Pressable onPress={() => handleNavClick("pass_and_play")} style={styles.playOptionDark}>
              <View style={styles.playOptionIconBoxPurple}>
                <Users size={16} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Pass & Play</Text>
                <Text style={styles.playOptionSub}>2 Players on 1 Local Device</Text>
              </View>
              <ChevronRight size={16} color="#A1A1AA" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={isDrawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setIsDrawerOpen(false)} />
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerUserRow}>
                <Image source={{ uri: user.avatar }} style={styles.drawerAvatar} />
                <View>
                  <Text style={styles.drawerUserName}>{user.name}</Text>
                  <Text style={styles.drawerUserMeta}>{user.rating.rapid} ELO • {user.dailyStreak}d Streak</Text>
                </View>
              </View>
              <Pressable onPress={() => setIsDrawerOpen(false)} style={styles.closeBtn}>
                <X size={16} color="#A1A1AA" />
              </Pressable>
            </View>

            <ScrollView style={styles.drawerScroll}>
              <Text style={styles.sectionHeader}>PLAY & COMPETE</Text>

              <Pressable onPress={() => handleNavClick("tournaments")} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <Trophy size={16} color={GOLD[300]} />
                  <Text style={styles.drawerItemText}>Tournaments</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("puzzle")} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <Puzzle size={16} color={GOLD[300]} />
                  <Text style={styles.drawerItemText}>Puzzles</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("learn")} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <BookOpen size={16} color={GOLD[300]} />
                  <Text style={styles.drawerItemText}>Learn & Academy</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("analysis")} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <BarChart3 size={16} color={GOLD[300]} />
                  <Text style={styles.drawerItemText}>Analysis Engine</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("leaderboard")} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <Award size={16} color={GOLD[300]} />
                  <Text style={styles.drawerItemText}>Rankings & Global Leaderboard</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>SOCIAL & ACCOUNT</Text>

              <Pressable onPress={handleSocialClick} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <Bell size={16} color="#F43F5E" />
                  <Text style={styles.drawerItemText}>Notifications & Invites</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("profile")} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <User size={16} color="#60A5FA" />
                  <Text style={styles.drawerItemText}>Player Profile</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>

              <Pressable onPress={handleSettingsClick} style={styles.drawerItem}>
                <View style={styles.drawerItemLeft}>
                  <Settings size={16} color="#A1A1AA" />
                  <Text style={styles.drawerItemText}>Preferences & Settings</Text>
                </View>
                <ChevronRight size={14} color="#52525B" />
              </Pressable>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Pressable onPress={handleAuthClick} style={styles.authBtn}>
                <Text style={styles.authBtnText}>{isAuthenticated ? "Manage Passport Profile" : "Sign In / Register"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerSafeArea: { backgroundColor: DARK[800] },
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "rgba(5, 5, 7, 0.85)", borderBottomWidth: 1, borderBottomColor: "rgba(212, 175, 55, 0.15)" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: { padding: 7, borderRadius: 14, backgroundColor: GOLD[300], ...premiumShadow },
  brandTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandText: { color: GOLD[300], fontSize: 18, fontWeight: "bold", letterSpacing: 1 },
  proPill: { backgroundColor: "rgba(212, 175, 55, 0.15)", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  proText: { color: GOLD[300], fontSize: 8, fontWeight: "bold", letterSpacing: 0.5 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(212, 175, 55, 0.08)", borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14 },
  streakText: { color: GOLD[300], fontSize: 10, fontWeight: "bold" },
  profileBtn: { borderRadius: 16 },
  avatarImg: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: GOLD[300] },
  iconBtn: { padding: 7, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", position: "relative" },
  unreadBadge: { position: "absolute", top: -2, right: -2, backgroundColor: "#F43F5E", borderRadius: 7, width: 14, height: 14, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: DARK[800] },
  unreadText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
  menuBtn: { padding: 7, borderRadius: 12, backgroundColor: "rgba(212, 175, 55, 0.08)", borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.2)" },
  bottomNavContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(8, 8, 11, 0.92)", borderTopWidth: 1, borderTopColor: "rgba(212, 175, 55, 0.15)", paddingBottom: 4 },
  bottomNavInner: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start", paddingVertical: 8 },
  bottomTab: { alignItems: "center", gap: 3, paddingHorizontal: 16, paddingVertical: 2 },
  bottomTabText: { color: "#71717A", fontSize: 10, fontWeight: "500" },
  activeBottomText: { color: GOLD[300], fontWeight: "bold" },
  activeIndicator: { position: "absolute", top: -8, width: 24, height: 3, borderRadius: 2, backgroundColor: GOLD[300] },
  bottomUnreadDot: { position: "absolute", top: -2, right: -6, backgroundColor: "#F43F5E", borderRadius: 7, paddingHorizontal: 4, minWidth: 14, height: 14, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(8,8,11,0.92)" },
  bottomUnreadText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
  playOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end", padding: 16, paddingBottom: 80 },
  playCard: { ...glassCard, borderRadius: 20, padding: 16, gap: 10 },
  playHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(212, 175, 55, 0.15)" },
  playHeaderTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  playHeaderTitle: { color: "#FDE68A", fontWeight: "bold", fontSize: 14 },
  closeIconBtn: { padding: 4 },
  playOptionGold: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(212, 175, 55, 0.12)", borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.25)", padding: 14, borderRadius: 16 },
  playOptionDark: { flexDirection: "row", alignItems: "center", gap: 12, ...glassCardSubtle, borderRadius: 16, padding: 14 },
  playOptionIconBoxGold: { backgroundColor: GOLD[300], padding: 10, borderRadius: 12 },
  playOptionIconBoxGreen: { backgroundColor: "#10B981", padding: 10, borderRadius: 12 },
  playOptionIconBoxPurple: { backgroundColor: "#A855F7", padding: 10, borderRadius: 12 },
  playOptionTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  playOptionSub: { color: "#A1A1AA", fontSize: 10, marginTop: 2 },
  drawerOverlay: { flex: 1, flexDirection: "row" },
  drawerCard: { width: "82%", maxWidth: 340, backgroundColor: "rgba(10, 10, 14, 0.96)", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderLeftWidth: 1, borderLeftColor: "rgba(212, 175, 55, 0.2)", maxHeight: "100%", padding: 16 },
  drawerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  drawerUserRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  drawerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: GOLD[300] },
  drawerUserName: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  drawerUserMeta: { color: GOLD[300], fontSize: 10, marginTop: 2 },
  closeBtn: { padding: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  drawerScroll: { marginVertical: 14 },
  sectionHeader: { color: GOLD[300], fontSize: 10, fontWeight: "bold", letterSpacing: 1.5, marginBottom: 8 },
  drawerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", ...glassCardSubtle, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginVertical: 3 },
  drawerItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  drawerItemText: { color: "#E4E4E7", fontSize: 13, fontWeight: "600" },
  drawerFooter: { paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  authBtn: { backgroundColor: GOLD[300], paddingVertical: 12, borderRadius: 14, alignItems: "center", ...premiumShadow },
  authBtnText: { color: "#000", fontWeight: "bold", fontSize: 12, letterSpacing: 0.5 },
});

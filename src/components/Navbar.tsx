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
  Clock,
  Sparkles,
  Award,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import { GameMode, UserProfile } from "../types/chess";

interface NavbarProps {
  currentMode: GameMode | "home" | "leaderboard" | "profile" | "tournaments" | "admin";
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

  return (
    <>
      {/* Top Bar Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContainer}>
          {/* Brand Logo */}
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

          {/* User Profile & Actions */}
          <View style={styles.headerActions}>
            {/* Streak */}
            <View style={styles.streakBadge}>
              <Flame size={12} color="#D4AF37" />
              <Text style={styles.streakText}>{user.dailyStreak}d</Text>
            </View>

            {/* Profile Avatar */}
            <Pressable onPress={handleAuthClick} style={styles.profileBtn}>
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            </Pressable>

            {/* Social Hub Icon */}
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

            {/* Hamburger Trigger */}
            <Pressable onPress={() => setIsDrawerOpen(true)} style={styles.menuBtn}>
              <Menu size={18} color="#D4AF37" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* MOBILE BOTTOM 3-TAB + MORE NAVIGATION */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavRow}>
          {/* Tab 1: Home */}
          <Pressable
            onPress={() => handleNavClick("home")}
            style={[styles.bottomTab, currentMode === "home" && styles.activeBottomTab]}
          >
            <Home size={18} color={currentMode === "home" ? "#D4AF37" : "#A1A1AA"} />
            <Text style={[styles.bottomTabText, currentMode === "home" && styles.activeBottomText]}>
              Home
            </Text>
          </Pressable>

          {/* Tab 2: Play */}
          <Pressable
            onPress={() => setIsPlayMenuOpen(!isPlayMenuOpen)}
            style={[
              styles.bottomTab,
              (["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen) &&
                styles.activeBottomTab,
            ]}
          >
            <Swords
              size={18}
              color={
                ["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen
                  ? "#D4AF37"
                  : "#A1A1AA"
              }
            />
            <Text
              style={[
                styles.bottomTabText,
                (["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen) &&
                  styles.activeBottomText,
              ]}
            >
              Play
            </Text>
          </Pressable>

          {/* Tab 3: Social */}
          <Pressable onPress={handleSocialClick} style={styles.bottomTab}>
            <View style={{ position: "relative" }}>
              <Users size={18} color="#A1A1AA" />
              {unreadSocialCount > 0 && (
                <View style={styles.bottomUnreadDot}>
                  <Text style={styles.bottomUnreadText}>{unreadSocialCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.bottomTabText}>Social</Text>
          </Pressable>

          {/* Tab 4: More */}
          <Pressable onPress={() => setIsDrawerOpen(true)} style={styles.bottomTab}>
            <Menu size={18} color="#A1A1AA" />
            <Text style={styles.bottomTabText}>More</Text>
          </Pressable>
        </View>
      </View>

      {/* PLAY MODES MODAL POPUP */}
      <Modal visible={isPlayMenuOpen} transparent animationType="fade">
        <Pressable style={styles.playOverlay} onPress={() => setIsPlayMenuOpen(false)}>
          <View style={styles.playCard}>
            <View style={styles.playHeader}>
              <View style={styles.playHeaderTitleRow}>
                <Swords size={16} color="#D4AF37" />
                <Text style={styles.playHeaderTitle}>Select Game Mode</Text>
              </View>
              <Pressable onPress={() => setIsPlayMenuOpen(false)}>
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
              <ChevronRight size={16} color="#D4AF37" />
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

      {/* SLIDE-OUT DRAWER */}
      <Modal visible={isDrawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerCard}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerUserRow}>
                <Image source={{ uri: user.avatar }} style={styles.drawerAvatar} />
                <View>
                  <Text style={styles.drawerUserName}>{user.name}</Text>
                  <Text style={styles.drawerUserMeta}>
                    {user.rating.rapid} ELO • {user.dailyStreak}d Streak
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setIsDrawerOpen(false)} style={styles.closeBtn}>
                <X size={16} color="#A1A1AA" />
              </Pressable>
            </View>

            {/* Menu Sections */}
            <ScrollView style={styles.drawerScroll}>
              <Text style={styles.sectionHeader}>PLAY & COMPETE</Text>
              <Pressable onPress={() => handleNavClick("tournaments")} style={styles.drawerItem}>
                <Trophy size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Tournaments</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("puzzle")} style={styles.drawerItem}>
                <Puzzle size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Puzzles</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("learn")} style={styles.drawerItem}>
                <BookOpen size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Learn & Academy</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("analysis")} style={styles.drawerItem}>
                <BarChart3 size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Analysis Engine</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("leaderboard")} style={styles.drawerItem}>
                <Award size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Rankings & Global Leaderboard</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>SOCIAL & ACCOUNT</Text>
              <Pressable onPress={handleSocialClick} style={styles.drawerItem}>
                <Bell size={16} color="#F43F5E" />
                <Text style={styles.drawerItemText}>Notifications & Invites</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("profile")} style={styles.drawerItem}>
                <User size={16} color="#60A5FA" />
                <Text style={styles.drawerItemText}>Player Profile</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={handleSettingsClick} style={styles.drawerItem}>
                <Settings size={16} color="#A1A1AA" />
                <Text style={styles.drawerItemText}>Preferences & Settings</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("admin")} style={styles.drawerItem}>
                <Shield size={16} color="#F87171" />
                <Text style={styles.drawerItemText}>Admin Moderation</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Pressable onPress={handleAuthClick} style={styles.authBtn}>
                <Text style={styles.authBtnText}>
                  {isAuthenticated ? "Manage Passport Profile" : "Sign In / Register"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: "#050505",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#050505",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  brandText: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  proPill: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proText: {
    color: "#D4AF37",
    fontSize: 8,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  streakText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  profileBtn: {
    borderRadius: 16,
  },
  avatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    position: "relative",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#F43F5E",
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  menuBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#090A10",
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    paddingVertical: 6,
  },
  bottomNavRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomTab: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 12,
  },
  activeBottomTab: {},
  bottomTabText: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  activeBottomText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  bottomUnreadDot: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#F43F5E",
    borderRadius: 6,
    paddingHorizontal: 3,
  },
  bottomUnreadText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  playOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 70,
  },
  playCard: {
    backgroundColor: "#121420",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 16,
    gap: 8,
  },
  playHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  playHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playHeaderTitle: {
    color: "#FDE68A",
    fontWeight: "bold",
    fontSize: 13,
  },
  playOptionGold: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 12,
    borderRadius: 14,
  },
  playOptionDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 14,
  },
  playOptionIconBoxGold: {
    backgroundColor: "#D4AF37",
    padding: 8,
    borderRadius: 10,
  },
  playOptionIconBoxGreen: {
    backgroundColor: "#10B981",
    padding: 8,
    borderRadius: 10,
  },
  playOptionIconBoxPurple: {
    backgroundColor: "#A855F7",
    padding: 8,
    borderRadius: 10,
  },
  playOptionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  playOptionSub: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  drawerCard: {
    backgroundColor: "#0D0E15",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.3)",
    maxHeight: "80%",
    padding: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  drawerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  drawerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  drawerUserName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  drawerUserMeta: {
    color: "#D4AF37",
    fontSize: 10,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  drawerScroll: {
    marginVertical: 12,
  },
  sectionHeader: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 3,
  },
  drawerItemText: {
    flex: 1,
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 10,
  },
  drawerFooter: {
    paddingTop: 8,
  },
  authBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  authBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
});

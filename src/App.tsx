import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, StatusBar, Text } from "react-native";
import { Navbar } from "./components/Navbar";
import { HomeView } from "./views/HomeView";
import { PlayVsAiView } from "./views/PlayVsAiView";
import { PlayOnlineView } from "./views/PlayOnlineView";
import { PlayPassView } from "./views/PlayPassView";
import { PuzzlesView } from "./views/PuzzlesView";
import { AnalysisView } from "./views/AnalysisView";
import { LearnView } from "./views/LearnView";
import { LeaderboardView } from "./views/LeaderboardView";
import { ProfileView } from "./views/ProfileView";
import { TournamentView } from "./views/TournamentView";
import { AdminView } from "./views/AdminView";
import { SettingsModal } from "./views/SettingsModal";
import { AuthModal } from "./components/AuthModal";
import { SocialHubModal } from "./components/SocialHubModal";
import { GameMode, GameSettings, UserProfile } from "./types/chess";
import { useAuth, initializeAuth } from "./services/authService";
import { useSocialStore } from "./services/socialStore";
import { userSettingsRepository } from "./repositories/UserSettingsRepository";

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode | "home" | "leaderboard" | "profile">("home");
  const authState = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSocialOpen, setIsSocialOpen] = useState<boolean>(false);

  const { incomingRequests, unreadNotificationCount, matchInvites } = useSocialStore();
  const totalUnreadSocial = incomingRequests.length + unreadNotificationCount + matchInvites.length;

  const [settings, setSettings] = useState<GameSettings>({
    boardTheme: "gold",
    pieceTheme: "neo_staunton",
    soundEnabled: true,
    highlightLegalMoves: true,
    showEvalBar: true,
    autoFlipBoard: false,
    coachEnabled: true,
    moveAnimationSpeed: "normal",
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    initializeAuth((remoteSettings) => {
      setSettings((prev) => ({ ...prev, ...remoteSettings }));
    });
  }, []);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (authState.user) {
        userSettingsRepository.saveSettings(authState.user.id, updated).catch((err) => {
          console.warn("Failed to persist user settings:", err);
        });
      }
      return updated;
    });
  };

  const handleSolvePuzzle = () => {};

  const activeUser: UserProfile = authState.profile;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Header Navbar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        user={activeUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSocial={() => setIsSocialOpen(true)}
        unreadSocialCount={totalUnreadSocial}
        isAuthenticated={authState.isAuthenticated}
      />

      {/* Main Screen Body */}
      <View style={styles.main}>
        {currentMode === "home" && (
          <HomeView
            onSelectMode={(mode) => setCurrentMode(mode)}
            user={activeUser}
          />
        )}

        {currentMode === "vs_ai" && (
          <PlayVsAiView
            user={activeUser}
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "online" && (
          <PlayOnlineView
            user={activeUser}
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "pass_and_play" && (
          <PlayPassView
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "puzzle" && (
          <PuzzlesView
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
            onSolvePuzzle={handleSolvePuzzle}
          />
        )}

        {currentMode === "analysis" && (
          <AnalysisView
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "learn" && (
          <LearnView
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "leaderboard" && (
          <LeaderboardView
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "profile" && (
          <ProfileView
            user={activeUser}
            onBackToHome={() => setCurrentMode("home")}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentMode === "tournaments" && (
          <TournamentView
            user={activeUser}
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "admin" && (
          <AdminView
            onBackToHome={() => setCurrentMode("home")}
          />
        )}
      </View>

      {/* Ticker Footer */}
      <View style={styles.ticker}>
        <Text style={styles.tickerText}>
          LIVE: GUKESH D. VS DING LIREN • CHESS.IN CIRCUIT 2026
        </Text>
      </View>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SocialHubModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        onLaunchMatch={() => {
          setCurrentMode("online");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  main: {
    flex: 1,
  },
  ticker: {
    backgroundColor: "#D4AF37",
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tickerText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

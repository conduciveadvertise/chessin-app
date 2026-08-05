import React from "react";
import { View, Text, Pressable, Switch, StyleSheet, Modal, ScrollView } from "react-native";
import {
  X,
  Volume2,
  Eye,
  Sparkles,
  SlidersHorizontal,
  Crown,
} from "lucide-react-native";
import { GameSettings, BoardTheme, PieceTheme } from "../types/chess";
import { soundManager } from "../services/sound";
import { glassCard, glassCardSubtle, premiumShadow, GOLD, DARK } from "../lib/theme";

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const boardThemes: Array<{ id: BoardTheme; name: string; colors: string[] }> = [
    { id: "gold", name: "Gold", colors: ["#D4AF37", "#1A1A22"] },
    { id: "emerald", name: "Emerald", colors: ["#10B981", "#0A0A0C"] },
    { id: "marble", name: "Slate", colors: ["#71717A", "#1A1A22"] },
    { id: "cyber", name: "Cyber", colors: ["#06B6D4", "#0A0A0C"] },
  ];

  const pieceStyles: Array<{ id: PieceTheme; name: string }> = [
    { id: "neo_staunton", name: "Neo Staunton" },
    { id: "royal_gold", name: "Royal Gold" },
    { id: "minimalist", name: "Minimalist" },
  ];

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.scrollWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.headerIconBox}>
                  <SlidersHorizontal size={18} color={GOLD[300]} />
                </View>
                <Text style={styles.title}>Chess Settings</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={18} color="#A1A1AA" />
              </Pressable>
            </View>

            {/* ═══ Board Aesthetic ═══ */}
            <Text style={styles.sectionLabel}>BOARD AESTHETIC</Text>
            <View style={styles.themeGrid}>
              {boardThemes.map((theme) => (
                <Pressable
                  key={theme.id}
                  onPress={() => onUpdateSettings({ boardTheme: theme.id })}
                  style={[
                    styles.themeChip,
                    settings.boardTheme === theme.id && styles.activeThemeChip,
                  ]}
                >
                  <View style={styles.swatchRow}>
                    {theme.colors.map((c, i) => (
                      <View
                        key={i}
                        style={[styles.swatch, { backgroundColor: c }]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.themeText,
                      settings.boardTheme === theme.id && styles.activeThemeText,
                    ]}
                  >
                    {theme.name}
                  </Text>
                  {settings.boardTheme === theme.id && (
                    <View style={styles.activeDot} />
                  )}
                </Pressable>
              ))}
            </View>

            {/* ═══ Piece Style ═══ */}
            <Text style={styles.sectionLabel}>PIECE STYLE</Text>
            <View style={styles.pieceStyleRow}>
              {pieceStyles.map((ps) => (
                <Pressable
                  key={ps.id}
                  onPress={() => onUpdateSettings({ pieceTheme: ps.id })}
                  style={[
                    styles.pieceChip,
                    settings.pieceTheme === ps.id && styles.activePieceChip,
                  ]}
                >
                  <Crown
                    size={14}
                    color={settings.pieceTheme === ps.id ? GOLD[300] : "#71717A"}
                  />
                  <Text
                    style={[
                      styles.pieceText,
                      settings.pieceTheme === ps.id && styles.activePieceText,
                    ]}
                  >
                    {ps.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ═══ Toggle Switches ═══ */}
            <Text style={styles.sectionLabel}>PREFERENCES</Text>
            <View style={styles.togglesWrap}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelRow}>
                  <View style={styles.toggleIconBox}>
                    <Volume2 size={16} color={GOLD[300]} />
                  </View>
                  <View>
                    <Text style={styles.toggleText}>Sound Effects</Text>
                    <Text style={styles.toggleSub}>Move & capture sounds</Text>
                  </View>
                </View>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(val) => {
                    soundManager.enabled = val;
                    onUpdateSettings({ soundEnabled: val });
                  }}
                  trackColor={{ false: "#27272A", true: GOLD[300] }}
                  thumbColor={settings.soundEnabled ? "#000" : "#A1A1AA"}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelRow}>
                  <View style={styles.toggleIconBox}>
                    <Eye size={16} color={GOLD[300]} />
                  </View>
                  <View>
                    <Text style={styles.toggleText}>Legal Move Highlights</Text>
                    <Text style={styles.toggleSub}>Show valid moves on tap</Text>
                  </View>
                </View>
                <Switch
                  value={settings.highlightLegalMoves}
                  onValueChange={(val) => onUpdateSettings({ highlightLegalMoves: val })}
                  trackColor={{ false: "#27272A", true: GOLD[300] }}
                  thumbColor={settings.highlightLegalMoves ? "#000" : "#A1A1AA"}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelRow}>
                  <View style={styles.toggleIconBox}>
                    <Sparkles size={16} color={GOLD[300]} />
                  </View>
                  <View>
                    <Text style={styles.toggleText}>Evaluation Bar</Text>
                    <Text style={styles.toggleSub}>Show engine eval sidebar</Text>
                  </View>
                </View>
                <Switch
                  value={settings.showEvalBar}
                  onValueChange={(val) => onUpdateSettings({ showEvalBar: val })}
                  trackColor={{ false: "#27272A", true: GOLD[300] }}
                  thumbColor={settings.showEvalBar ? "#000" : "#A1A1AA"}
                />
              </View>
            </View>

            {/* Save Button */}
            <Pressable onPress={onClose} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    padding: 20,
  },
  scrollWrap: {
    maxHeight: "90%",
  },
  content: {
    ...glassCard,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    ...premiumShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.12)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  title: {
    color: GOLD[300],
    fontSize: 16,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  sectionLabel: {
    color: GOLD[300],
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  // ═══ Board Themes ═══
  themeGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  themeChip: {
    width: "48%",
    ...glassCardSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 6,
  },
  activeThemeChip: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderColor: GOLD[300],
    borderWidth: 1.5,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 4,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  themeText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeThemeText: {
    color: GOLD[300],
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD[300],
  },
  // ═══ Piece Styles ═══
  pieceStyleRow: {
    flexDirection: "row",
    gap: 8,
  },
  pieceChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...glassCardSubtle,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  activePieceChip: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderColor: GOLD[300],
    borderWidth: 1.5,
  },
  pieceText: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "bold",
  },
  activePieceText: {
    color: GOLD[300],
  },
  // ═══ Toggles ═══
  togglesWrap: {
    gap: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...glassCardSubtle,
    borderRadius: 14,
    padding: 12,
  },
  toggleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  toggleIconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  toggleText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  toggleSub: {
    color: "#71717A",
    fontSize: 9,
    marginTop: 1,
  },
  // ═══ Save ═══
  saveBtn: {
    backgroundColor: GOLD[300],
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
    ...premiumShadow,
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

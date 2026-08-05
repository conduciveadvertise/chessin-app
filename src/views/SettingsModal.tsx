import React from "react";
import { View, Text, Pressable, Switch, StyleSheet, Modal } from "react-native";
import { X, Volume2, VolumeX, Eye, Sparkles, SlidersHorizontal } from "lucide-react-native";
import { GameSettings, BoardTheme, PieceTheme } from "../types/chess";
import { soundManager } from "../services/sound";

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
  const boardThemes: Array<{ id: BoardTheme; name: string }> = [
    { id: "gold", name: "Gold" },
    { id: "emerald", name: "Emerald" },
    { id: "marble", name: "Slate" },
    { id: "cyber", name: "Cyber" },
  ];

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <SlidersHorizontal size={18} color="#D4AF37" />
              <Text style={styles.title}>Chess Settings</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Board Aesthetic */}
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
                <Text
                  style={[
                    styles.themeText,
                    settings.boardTheme === theme.id && styles.activeThemeText,
                  ]}
                >
                  {theme.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelRow}>
              <Volume2 size={16} color="#D4AF37" />
              <Text style={styles.toggleText}>Sound Effects</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val) => {
                soundManager.enabled = val;
                onUpdateSettings({ soundEnabled: val });
              }}
              trackColor={{ false: "#27272A", true: "#D4AF37" }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelRow}>
              <Eye size={16} color="#D4AF37" />
              <Text style={styles.toggleText}>Legal Move Highlights</Text>
            </View>
            <Switch
              value={settings.highlightLegalMoves}
              onValueChange={(val) => onUpdateSettings({ highlightLegalMoves: val })}
              trackColor={{ false: "#27272A", true: "#D4AF37" }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelRow}>
              <Sparkles size={16} color="#D4AF37" />
              <Text style={styles.toggleText}>Evaluation Bar</Text>
            </View>
            <Switch
              value={settings.showEvalBar}
              onValueChange={(val) => onUpdateSettings({ showEvalBar: val })}
              trackColor={{ false: "#27272A", true: "#D4AF37" }}
            />
          </View>

          <Pressable onPress={onClose} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#121420",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  themeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  themeChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  activeThemeChip: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  themeText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeThemeText: {
    color: "#D4AF37",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: 12,
  },
  toggleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleText: {
    color: "#FFF",
    fontSize: 12,
  },
  saveBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
});

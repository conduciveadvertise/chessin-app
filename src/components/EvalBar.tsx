import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EvalBarProps {
  score: number;
  orientation?: "w" | "b";
}

export const EvalBar: React.FC<EvalBarProps> = ({ score, orientation = "w" }) => {
  const clampedScore = Math.max(-10, Math.min(10, score));
  const whitePercent = ((clampedScore + 10) / 20) * 100;
  const displayPercent = orientation === "w" ? whitePercent : 100 - whitePercent;

  const scoreText = Math.abs(score) > 900 ? "MATE" : `${score > 0 ? "+" : ""}${score.toFixed(1)}`;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { height: `${100 - displayPercent}%` as any }]} />
      <View style={[styles.bottomBar, { height: `${displayPercent}%` as any }]} />

      <View style={styles.badgeOverlay}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{scoreText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 18,
    height: "100%",
    minHeight: 280,
    backgroundColor: "#18181B",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    overflow: "hidden",
    position: "relative",
  },
  topBar: {
    width: "100%",
    backgroundColor: "#18181B",
  },
  bottomBar: {
    width: "100%",
    backgroundColor: "#FEF3C7",
  },
  badgeOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  badgeText: {
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieceTheme } from "../types/chess";
import { ChessPiece } from "./ChessPieces";

interface CapturedPiecesProps {
  captured: Array<{ type: "p" | "n" | "b" | "r" | "q" | "k"; color: "w" | "b" }>;
  pieceTheme?: PieceTheme;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  captured,
  pieceTheme = "neo_staunton",
}) => {
  const PIECE_VALUES: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  const whiteCaptured = captured.filter((p) => p.color === "b");
  const blackCaptured = captured.filter((p) => p.color === "w");

  const whiteMaterial = whiteCaptured.reduce((acc, item) => acc + PIECE_VALUES[item.type], 0);
  const blackMaterial = blackCaptured.reduce((acc, item) => acc + PIECE_VALUES[item.type], 0);

  const whiteDiff = whiteMaterial - blackMaterial;
  const blackDiff = blackMaterial - whiteMaterial;

  return (
    <View style={styles.container}>
      {/* White Captured */}
      <View style={styles.pieceRow}>
        {whiteCaptured.map((piece, idx) => (
          <View key={idx} style={styles.pieceWrapper}>
            <ChessPiece type={piece.type} color="b" theme={pieceTheme} size={20} />
          </View>
        ))}
        {whiteDiff > 0 && (
          <View style={styles.diffBadgeGold}>
            <Text style={styles.diffTextGold}>+{whiteDiff}</Text>
          </View>
        )}
      </View>

      <Text style={styles.centerLabel}>CAPTURED</Text>

      {/* Black Captured */}
      <View style={[styles.pieceRow, styles.pieceRowRight]}>
        {blackDiff > 0 && (
          <View style={styles.diffBadgeWhite}>
            <Text style={styles.diffTextWhite}>+{blackDiff}</Text>
          </View>
        )}
        {blackCaptured.map((piece, idx) => (
          <View key={idx} style={styles.pieceWrapper}>
            <ChessPiece type={piece.type} color="w" theme={pieceTheme} size={20} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
  pieceRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "42%",
  },
  pieceRowRight: {
    justifyContent: "flex-end",
  },
  pieceWrapper: {
    marginRight: -6,
  },
  centerLabel: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  diffBadgeGold: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  diffTextGold: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  diffBadgeWhite: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  diffTextWhite: {
    color: "#E4E4E7",
    fontSize: 10,
    fontWeight: "bold",
  },
});

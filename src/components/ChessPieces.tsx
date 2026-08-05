import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { PieceTheme } from "../types/chess";

interface ChessPieceProps {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
  theme?: PieceTheme;
  size?: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  theme = "neo_staunton",
  size = 38,
}) => {
  const isWhite = color === "w";
  const pieceId = `${theme}-${color}-${type}`;

  if (theme === "minimalist") {
    const symbolsWhite: Record<string, string> = {
      p: "♙",
      n: "♘",
      b: "♗",
      r: "♖",
      q: "♕",
      k: "♔",
    };
    const symbolsBlack: Record<string, string> = {
      p: "♟",
      n: "♞",
      b: "♝",
      r: "♜",
      q: "♛",
      k: "♚",
    };
    return (
      <View style={styles.center}>
        <Text
          style={[
            styles.minimalistText,
            {
              fontSize: size * 0.8,
              color: isWhite ? "#F5E080" : "#FFFFFF",
            },
          ]}
        >
          {isWhite ? symbolsWhite[type] : symbolsBlack[type]}
        </Text>
      </View>
    );
  }

  const getThemeColors = () => {
    if (theme === "royal_gold") {
      return {
        fillGradStart: isWhite ? "#FFE898" : "#3A301E",
        fillGradEnd: isWhite ? "#D4AF37" : "#1A150A",
        stroke: isWhite ? "#7A5E0B" : "#D4AF37",
        accent: "#F5E080",
      };
    }
    return {
      fillGradStart: isWhite ? "#FFFFFF" : "#333338",
      fillGradEnd: isWhite ? "#ECECEF" : "#18181B",
      stroke: isWhite ? "#18181B" : "#000000",
      accent: isWhite ? "#D4AF37" : "#A1A1AA",
    };
  };

  const colors = getThemeColors();

  return (
    <View style={styles.center}>
      <Svg width={size} height={size} viewBox="0 0 45 45">
        <Defs>
          <LinearGradient id={`grad-${pieceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.fillGradStart} />
            <Stop offset="100%" stopColor={colors.fillGradEnd} />
          </LinearGradient>
        </Defs>

        <G
          fill={`url(#grad-${pieceId})`}
          fillRule="evenodd"
          stroke={colors.stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {type === "p" && (
            <G>
              <Path d="M 22.5,9 C 19.8,9 18,10.8 18,13.5 C 18,14.8 18.5,16 19.3,16.9 C 17.5,18.2 16.5,20.4 16.5,22.8 C 16.5,24.8 17.2,26.5 18.5,27.7 C 16.2,29.5 14,33 14,36 L 31,36 C 31,33 28.8,29.5 26.5,27.7 C 27.8,26.5 28.5,24.8 28.5,22.8 C 28.5,20.4 27.5,18.2 25.7,16.9 C 26.5,16 27,14.8 27,13.5 C 27,10.8 25.2,9 22.5,9 z" />
              <Path d="M 14,36 L 31,36 L 31,38 L 14,38 z" />
            </G>
          )}

          {type === "r" && (
            <G>
              <Path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 31,17 L 31,29 L 14,29 L 14,17 L 11,14 z" />
              <Path d="M 12,14 L 33,14 M 14,29 L 31,29" stroke={colors.stroke} strokeWidth={1.2} />
            </G>
          )}

          {type === "n" && (
            <G>
              <Path d="M 22,10 C 32.5,11 28.5,22 34.5,25 C 31.5,25 31,24 30,26.5 C 29,29 28,32 25.5,33 C 22.5,34 18.5,35 15,35 C 13,35 13,32 14,30 C 12,30 11,28.5 11,27 C 11,25 12,24 13.5,24.5 C 15,25 16,24.5 16.5,23 C 17,21.5 15.5,20.5 14.5,19 C 13.5,17.5 14.5,15.5 16,15 C 17.5,14.5 19,15 20,14.5 C 21,14 20,11 22,10 z" />
              <Circle cx="20" cy="16" r="1.5" fill={colors.stroke} />
            </G>
          )}

          {type === "b" && (
            <G>
              <Path d="M 9,36 C 12.39,35.03 19.11,36.46 22.5,34 C 25.89,36.46 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,36.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.64,38.99 6.67,38.97 6,38 C 7.34,36.54 9,36 9,36 z" />
              <Path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,23 30,23 C 30,23 27.5,15 22.5,10 C 17.5,15 15,23 15,23 C 15,23 14.5,30.5 15,32 z" />
              <Circle cx="22.5" cy="8.5" r="2.5" fill={colors.accent} />
            </G>
          )}

          {type === "q" && (
            <G>
              <Path d="M 9 26 L 9 28 L 36 28 L 36 26 L 9 26 z" />
              <Path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,32 12.5,34.5 12,36 C 11.5,37.5 10,38 10,38 L 35,38 C 35,38 33.5,37.5 33,36 C 32.5,34.5 32.5,32 33.5,30 C 34.5,28 36,28 36,26 C 28,26 28,24 22.5,20 C 17,24 17,26 9,26 z" />
              <Path d="M 9 26 C 9 21 13 15 13 15 C 13 15 18 20 22.5 10 C 27 20 32 15 32 15 C 32 15 36 21 36 26" />
              <Circle cx="6" cy="12" r="2" fill={colors.accent} />
              <Circle cx="14" cy="9" r="2" fill={colors.accent} />
              <Circle cx="22.5" cy="7" r="2.5" fill={colors.accent} />
              <Circle cx="31" cy="9" r="2" fill={colors.accent} />
              <Circle cx="39" cy="12" r="2" fill={colors.accent} />
            </G>
          )}

          {type === "k" && (
            <G>
              <Path d="M 22.5,11.63 L 22.5,6 M 19.75,8.88 L 25.25,8.88" strokeWidth={2} />
              <Path d="M 11.5,37 C 17,35 28,35 33.5,37 C 34.5,33 35.5,21 35.5,21 C 31,16 27,15 22.5,18 C 18,15 14,16 9.5,21 C 9.5,21 10.5,33 11.5,37 z" />
              <Path d="M 11.5,30 C 17,28 28,28 33.5,30" />
              <Circle cx="22.5" cy="14" r="3" fill={colors.accent} />
            </G>
          )}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  minimalistText: {
    fontWeight: "bold",
  },
});

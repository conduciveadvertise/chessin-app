import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { Chess, Square } from "chess.js";
import { BoardTheme, PieceTheme } from "../types/chess";
import { ChessPiece } from "./ChessPieces";

interface ChessBoardProps {
  chess: Chess;
  boardTheme?: BoardTheme;
  pieceTheme?: PieceTheme;
  orientation?: "w" | "b";
  highlightLegalMoves?: boolean;
  onMove?: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
}

const { width: screenWidth } = Dimensions.get("window");
const BOARD_SIZE = Math.min(screenWidth - 32, 480);
const SQUARE_SIZE = BOARD_SIZE / 8;

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  boardTheme = "gold",
  pieceTheme = "neo_staunton",
  orientation = "w",
  highlightLegalMoves = true,
  onMove,
  disabled = false,
  lastMove = null,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);

  const getThemeColors = () => {
    switch (boardTheme) {
      case "emerald":
        return { light: "#ECE7D5", dark: "#1B3B2B", border: "#10B981" };
      case "marble":
        return { light: "#F0F0E4", dark: "#42688F", border: "#64748B" };
      case "cyber":
        return { light: "#809BCE", dark: "#1E2238", border: "#06B6D4" };
      default:
        return { light: "#E6D7A8", dark: "#1E2230", border: "#D4AF37" };
    }
  };

  const themeColors = getThemeColors();
  const isChecked = chess.inCheck();
  const currentTurn = chess.turn();

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const displayRanks = orientation === "w" ? ranks : [...ranks].reverse();
  const displayFiles = orientation === "w" ? files : [...files].reverse();

  const handleSquarePress = (squareStr: Square) => {
    if (disabled) return;

    if (selectedSquare === squareStr) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (selectedSquare && possibleMoves.includes(squareStr)) {
      const piece = chess.get(selectedSquare);

      if (
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && squareStr.endsWith("8")) ||
          (piece.color === "b" && squareStr.endsWith("1")))
      ) {
        setPromotionMove({ from: selectedSquare, to: squareStr });
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (onMove) {
        onMove(selectedSquare, squareStr);
      }
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const clickedPiece = chess.get(squareStr);
    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedSquare(squareStr);
      const moves = chess.moves({ square: squareStr, verbose: true });
      setPossibleMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handlePromotionSelect = (promotionPiece: "q" | "r" | "b" | "n") => {
    if (promotionMove && onMove) {
      onMove(promotionMove.from, promotionMove.to, promotionPiece);
    }
    setPromotionMove(null);
  };

  return (
    <View style={[styles.container, { width: BOARD_SIZE + 16, height: BOARD_SIZE + 16 }]}>
      <View style={[styles.boardFrame, { borderColor: themeColors.border, width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {displayRanks.map((rank, rIdx) => (
          <View key={rank} style={styles.row}>
            {displayFiles.map((file, cIdx) => {
              const squareStr = `${file}${rank}` as Square;
              const isLight = (rIdx + cIdx) % 2 === 0;
              const piece = chess.get(squareStr);

              const isSelected = selectedSquare === squareStr;
              const isPossibleMove = possibleMoves.includes(squareStr);
              const isLastMoveFrom = lastMove?.from === squareStr;
              const isLastMoveTo = lastMove?.to === squareStr;

              const isKingInCheck =
                isChecked &&
                piece &&
                piece.type === "k" &&
                piece.color === currentTurn;

              return (
                <Pressable
                  key={squareStr}
                  onPress={() => handleSquarePress(squareStr)}
                  style={[
                    styles.square,
                    {
                      width: SQUARE_SIZE,
                      height: SQUARE_SIZE,
                      backgroundColor: isLight ? themeColors.light : themeColors.dark,
                    },
                    isSelected && styles.selectedSquare,
                    (isLastMoveFrom || isLastMoveTo) && styles.lastMoveSquare,
                    isKingInCheck && styles.checkSquare,
                  ]}
                >
                  {/* Rank Label */}
                  {cIdx === 0 && (
                    <Text
                      style={[
                        styles.coordRank,
                        { color: isLight ? themeColors.dark : themeColors.light },
                      ]}
                    >
                      {rank}
                    </Text>
                  )}

                  {/* File Label */}
                  {rIdx === 7 && (
                    <Text
                      style={[
                        styles.coordFile,
                        { color: isLight ? themeColors.dark : themeColors.light },
                      ]}
                    >
                      {file}
                    </Text>
                  )}

                  {/* Move Highlight Dot */}
                  {highlightLegalMoves && isPossibleMove && (
                    <View style={styles.possibleDotOverlay}>
                      {piece ? (
                        <View style={styles.captureRing} />
                      ) : (
                        <View style={styles.moveDot} />
                      )}
                    </View>
                  )}

                  {/* Piece */}
                  {piece && (
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      theme={pieceTheme}
                      size={SQUARE_SIZE * 0.82}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Pawn Promotion Modal */}
      <Modal visible={Boolean(promotionMove)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pawn Promotion</Text>
            <Text style={styles.modalSub}>Select piece to promote to:</Text>

            <View style={styles.promoRow}>
              {[
                { type: "q", label: "Queen" },
                { type: "r", label: "Rook" },
                { type: "b", label: "Bishop" },
                { type: "n", label: "Knight" },
              ].map((item) => (
                <Pressable
                  key={item.type}
                  onPress={() => handlePromotionSelect(item.type as any)}
                  style={styles.promoBtn}
                >
                  <ChessPiece
                    type={item.type as any}
                    color={chess.turn()}
                    theme={pieceTheme}
                    size={36}
                  />
                  <Text style={styles.promoLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: "#0A0A0C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  boardFrame: {
    borderWidth: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  square: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  selectedSquare: {
    backgroundColor: "rgba(212, 175, 55, 0.5)",
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  lastMoveSquare: {
    backgroundColor: "rgba(212, 175, 55, 0.35)",
  },
  checkSquare: {
    backgroundColor: "rgba(225, 29, 72, 0.8)",
  },
  coordRank: {
    position: "absolute",
    top: 2,
    left: 2,
    fontSize: 9,
    fontWeight: "bold",
    opacity: 0.7,
  },
  coordFile: {
    position: "absolute",
    bottom: 2,
    right: 2,
    fontSize: 9,
    fontWeight: "bold",
    opacity: 0.7,
  },
  possibleDotOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  moveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D4AF37",
  },
  captureRing: {
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderColor: "#D4AF37",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#0D0D0D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    padding: 24,
    alignItems: "center",
    width: 280,
  },
  modalTitle: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSub: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  promoRow: {
    flexDirection: "row",
    gap: 8,
  },
  promoBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  promoLabel: {
    color: "#D4AF37",
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 4,
  },
});

import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  RefreshCw,
} from "lucide-react-native";

interface MoveHistoryProps {
  history: string[];
  currentMoveIndex?: number;
  onNavigateMove?: (index: number) => void;
  onUndo?: () => void;
  onFlipBoard?: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex = history.length - 1,
  onNavigateMove,
  onUndo,
  onFlipBoard,
}) => {
  const pairedMoves: Array<{
    round: number;
    white: string;
    black?: string;
    whiteIdx: number;
    blackIdx?: number;
  }> = [];

  for (let i = 0; i < history.length; i += 2) {
    pairedMoves.push({
      round: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIdx: i,
      black: history[i + 1],
      blackIdx: i + 1 < history.length ? i + 1 : undefined,
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MOVE HISTORY</Text>
        <Text style={styles.headerCount}>{history.length} MOVES</Text>
      </View>

      {/* Move Rows */}
      <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
        {pairedMoves.length === 0 ? (
          <Text style={styles.emptyText}>Match initiated... Moves will log here.</Text>
        ) : (
          pairedMoves.map((item) => (
            <View key={item.round} style={styles.moveRow}>
              <Text style={styles.roundNum}>{item.round}.</Text>

              {/* White move */}
              <Pressable
                onPress={() => onNavigateMove && onNavigateMove(item.whiteIdx)}
                style={[
                  styles.moveBtn,
                  currentMoveIndex === item.whiteIdx && styles.activeMoveBtn,
                ]}
              >
                <Text
                  style={[
                    styles.moveText,
                    currentMoveIndex === item.whiteIdx && styles.activeMoveText,
                  ]}
                >
                  {item.white}
                </Text>
              </Pressable>

              {/* Black move */}
              {item.black ? (
                <Pressable
                  onPress={() =>
                    onNavigateMove && item.blackIdx !== undefined && onNavigateMove(item.blackIdx)
                  }
                  style={[
                    styles.moveBtn,
                    currentMoveIndex === item.blackIdx && styles.activeMoveBtn,
                  ]}
                >
                  <Text
                    style={[
                      styles.moveText,
                      currentMoveIndex === item.blackIdx && styles.activeMoveText,
                    ]}
                  >
                    {item.black}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.emptyMove}>...</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer controls */}
      <View style={styles.footer}>
        <View style={styles.navRow}>
          <Pressable
            onPress={() => onNavigateMove && onNavigateMove(-1)}
            disabled={history.length === 0}
            style={styles.iconBtn}
          >
            <ChevronsLeft size={16} color="#A1A1AA" />
          </Pressable>
          <Pressable
            onPress={() => onNavigateMove && onNavigateMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex < 0}
            style={styles.iconBtn}
          >
            <ChevronLeft size={16} color="#A1A1AA" />
          </Pressable>
          <Pressable
            onPress={() =>
              onNavigateMove && onNavigateMove(Math.min(history.length - 1, currentMoveIndex + 1))
            }
            disabled={currentMoveIndex >= history.length - 1}
            style={styles.iconBtn}
          >
            <ChevronRight size={16} color="#A1A1AA" />
          </Pressable>
          <Pressable
            onPress={() => onNavigateMove && onNavigateMove(history.length - 1)}
            disabled={currentMoveIndex === history.length - 1}
            style={styles.iconBtn}
          >
            <ChevronsRight size={16} color="#A1A1AA" />
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          {Boolean(onUndo) && (
            <Pressable
              onPress={onUndo}
              disabled={history.length === 0}
              style={styles.actionPill}
            >
              <RotateCcw size={12} color="#D4D4D8" />
              <Text style={styles.actionPillText}>Undo</Text>
            </Pressable>
          )}

          {Boolean(onFlipBoard) && (
            <Pressable onPress={onFlipBoard} style={styles.goldPill}>
              <RefreshCw size={12} color="#D4AF37" />
              <Text style={styles.goldPillText}>Flip</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0A0C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  headerCount: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "bold",
  },
  scrollList: {
    maxHeight: 180,
  },
  scrollContent: {
    padding: 8,
  },
  emptyText: {
    color: "#71717A",
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 12,
    marginVertical: 20,
  },
  moveRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  roundNum: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "bold",
    width: 28,
  },
  moveBtn: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeMoveBtn: {
    backgroundColor: "#D4AF37",
  },
  moveText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  activeMoveText: {
    color: "#000000",
  },
  emptyMove: {
    flex: 1,
    color: "#3F3F46",
    fontSize: 12,
    marginHorizontal: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  navRow: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  actionPillText: {
    color: "#E4E4E7",
    fontSize: 10,
    fontWeight: "bold",
  },
  goldPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  goldPillText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
});

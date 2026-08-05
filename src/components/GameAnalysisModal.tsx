import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BarChart3,
  Sparkles,
} from "lucide-react-native";
import { fetchPostGameAnalysis } from "../services/api";
import { PostGameAnalysisData } from "../types/chess";

interface GameAnalysisModalProps {
  pgn: string;
  resultText: string;
  movesCount: number;
  playerColor: "White" | "Black";
  onClose: () => void;
  onRematch?: () => void;
  onOpenAnalysis?: () => void;
}

export const GameAnalysisModal: React.FC<GameAnalysisModalProps> = ({
  pgn,
  resultText,
  movesCount,
  playerColor,
  onClose,
  onRematch,
  onOpenAnalysis,
}) => {
  const [analysis, setAnalysis] = useState<PostGameAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchPostGameAnalysis(pgn, resultText, movesCount, playerColor).then((data) => {
      if (isMounted) {
        setAnalysis(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [pgn, resultText, movesCount, playerColor]);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.reportBadge}>
              <Text style={styles.reportBadgeText}>MATCH REPORT</Text>
            </View>
            <Text style={styles.resultTitle}>{resultText}</Text>
            <Text style={styles.resultMeta}>
              Total Moves: {movesCount} • Played as {playerColor}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.loadingText}>
                Gemini AI Coach is analyzing move accuracy...
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              {/* Accuracy */}
              <View style={styles.accuracyCard}>
                <View>
                  <Text style={styles.accuracyLabel}>ACCURACY SCORE</Text>
                  <Text style={styles.accuracyValue}>{analysis?.accuracyScore}%</Text>
                </View>
                <View style={styles.awardBadge}>
                  <Award size={28} color="#D4AF37" />
                </View>
              </View>

              {/* Metrics */}
              <View style={styles.metricsGrid}>
                <View style={[styles.metricCard, styles.bestCard]}>
                  <CheckCircle2 size={16} color="#34D399" />
                  <Text style={[styles.metricVal, { color: "#34D399" }]}>
                    {analysis?.bestMoves}
                  </Text>
                  <Text style={styles.metricLabel}>Best Moves</Text>
                </View>

                <View style={[styles.metricCard, styles.mistakeCard]}>
                  <AlertTriangle size={16} color="#FBBF24" />
                  <Text style={[styles.metricVal, { color: "#FBBF24" }]}>
                    {analysis?.mistakes}
                  </Text>
                  <Text style={styles.metricLabel}>Mistakes</Text>
                </View>

                <View style={[styles.metricCard, styles.blunderCard]}>
                  <XCircle size={16} color="#F87171" />
                  <Text style={[styles.metricVal, { color: "#F87171" }]}>
                    {analysis?.blunders}
                  </Text>
                  <Text style={styles.metricLabel}>Blunders</Text>
                </View>
              </View>

              {/* AI Review */}
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Sparkles size={12} color="#D4AF37" />
                  <Text style={styles.reviewTitle}>GRANDMASTER REVIEW</Text>
                </View>
                <Text style={styles.reviewText}>{analysis?.commentary}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionGrid}>
            {Boolean(onRematch) && (
              <Pressable onPress={onRematch} style={styles.rematchBtn}>
                <RotateCcw size={14} color="#000" />
                <Text style={styles.rematchBtnText}>Rematch</Text>
              </Pressable>
            )}

            {Boolean(onOpenAnalysis) && (
              <Pressable onPress={onOpenAnalysis} style={styles.analysisBtn}>
                <BarChart3 size={14} color="#D4AF37" />
                <Text style={styles.analysisBtnText}>Analysis Mode</Text>
              </Pressable>
            )}

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close Report</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#121420",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  reportBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 6,
  },
  reportBadgeText: {
    color: "#FDE68A",
    fontSize: 10,
    fontWeight: "bold",
  },
  resultTitle: {
    color: "#FDE68A",
    fontSize: 22,
    fontWeight: "bold",
  },
  resultMeta: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#FDE68A",
    fontSize: 12,
  },
  content: {
    gap: 12,
  },
  accuracyCard: {
    backgroundColor: "#1B1E2E",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accuracyLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
  },
  accuracyValue: {
    color: "#FDE68A",
    fontSize: 28,
    fontWeight: "bold",
  },
  awardBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    padding: 10,
    borderRadius: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#181A27",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  bestCard: { borderColor: "rgba(52, 211, 153, 0.3)" },
  mistakeCard: { borderColor: "rgba(251, 191, 36, 0.3)" },
  blunderCard: { borderColor: "rgba(248, 113, 113, 0.3)" },
  metricVal: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 2,
  },
  metricLabel: {
    color: "#A1A1AA",
    fontSize: 9,
  },
  reviewCard: {
    backgroundColor: "#181A27",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  reviewTitle: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  reviewText: {
    color: "#D4D4D8",
    fontSize: 11,
    lineHeight: 16,
  },
  actionGrid: {
    marginTop: 16,
    gap: 8,
  },
  rematchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    borderRadius: 12,
  },
  rematchBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  analysisBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    paddingVertical: 10,
    borderRadius: 12,
  },
  analysisBtnText: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 12,
  },
  closeBtn: {
    backgroundColor: "#27272A",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#D4D4D8",
    fontWeight: "bold",
    fontSize: 12,
  },
});

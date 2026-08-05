import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Sparkles, Brain, Lightbulb, Send } from "lucide-react-native";
import { fetchAiCoachAdvice } from "../services/api";
import { AiDifficulty } from "../types/chess";

interface AiCoachPanelProps {
  fen: string;
  lastMoveSan?: string;
  pgn?: string;
  evalScore?: number;
  difficulty?: AiDifficulty;
}

export const AiCoachPanel: React.FC<AiCoachPanelProps> = ({
  fen,
  lastMoveSan = "",
  pgn = "",
  evalScore = 0.0,
  difficulty = "medium" as AiDifficulty,
}) => {
  const coachDifficulty: AiDifficulty = difficulty as AiDifficulty;
  const [advice, setAdvice] = useState<string>(
    "Welcome! I am your Gemini AI Grandmaster Coach. Play a move and I'll analyze the position in real-time."
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "coach"; text: string }>>([]);

  const handleAskCoach = async () => {
    setLoading(true);
    const data = await fetchAiCoachAdvice(fen, lastMoveSan, pgn, evalScore, coachDifficulty);
    setAdvice(data.coachAdvice || "Keep central space locked and watch for diagonal tactics!");
    setLoading(false);
  };

  const handleSendCustomQuestion = async () => {
    if (!chatInput.trim() || loading) return;

    const userText = chatInput.trim();
    setChatLog((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setLoading(true);

    const data = await fetchAiCoachAdvice(
      fen,
      `User Question: ${userText}`,
      pgn,
      evalScore,
      coachDifficulty
    );

    setChatLog((prev) => [
      ...prev,
      { sender: "coach", text: data.coachAdvice || "Focus on controlling open files with your rooks." },
    ]);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Brain size={18} color="#D4AF37" />
          </View>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.headerTitle}>Grandmaster AI</Text>
              <View style={styles.geminiBadge}>
                <Text style={styles.geminiBadgeText}>GEMINI</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>Real-time Tactical Evaluation</Text>
          </View>
        </View>

        <Pressable
          onPress={handleAskCoach}
          disabled={loading}
          style={styles.analyzeBtn}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Sparkles size={12} color="#000" />
              <Text style={styles.analyzeBtnText}>Analyze</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Main Advice Card */}
      <View style={styles.adviceCard}>
        <Lightbulb size={16} color="#D4AF37" style={{ marginTop: 2 }} />
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      {/* Chat History */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {chatLog.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.chatBubble,
              item.sender === "user" ? styles.userBubble : styles.coachBubble,
            ]}
          >
            <Text style={styles.chatSender}>
              {item.sender === "user" ? "You" : "GM Coach"}
            </Text>
            <Text style={styles.chatText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Form */}
      <View style={styles.inputRow}>
        <TextInput
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="Ask e.g. Why was my last move bad?"
          placeholderTextColor="#71717A"
          style={styles.input}
        />
        <Pressable
          onPress={handleSendCustomQuestion}
          disabled={!chatInput.trim() || loading}
          style={styles.sendBtn}
        >
          <Send size={14} color="#000" />
        </Pressable>
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
    padding: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "bold",
  },
  geminiBadge: {
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  geminiBadgeText: {
    color: "#000",
    fontSize: 8,
    fontWeight: "bold",
  },
  headerSub: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  analyzeBtnText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "bold",
  },
  adviceCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  adviceText: {
    flex: 1,
    color: "#E4E4E7",
    fontSize: 12,
    lineHeight: 18,
  },
  chatScroll: {
    maxHeight: 140,
    marginVertical: 8,
  },
  chatContent: {
    gap: 8,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  coachBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chatSender: {
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  chatText: {
    color: "#E4E4E7",
    fontSize: 11,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 12,
  },
  sendBtn: {
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 20,
  },
});

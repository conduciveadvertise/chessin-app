import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MessageSquare, Send } from "lucide-react-native";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface MultiplayerChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

export const MultiplayerChat: React.FC<MultiplayerChatProps> = ({
  messages,
  onSendMessage,
  currentUser,
}) => {
  const [inputText, setInputText] = useState("");
  const quickReactions = ["🔥 Great move!", "👏 Well played!", "🧠 Deep tactics", "😅 Phew!", "👑 Checkmate?"];

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MessageSquare size={16} color="#D4AF37" />
          <Text style={styles.headerTitle}>MATCH CHAT</Text>
        </View>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Room</Text>
        </View>
      </View>

      {/* Message List */}
      <ScrollView style={styles.msgScroll} contentContainerStyle={styles.msgContent}>
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser;
          const isSystem = msg.sender === "System";

          if (isSystem) {
            return (
              <View key={msg.id} style={styles.systemWrap}>
                <Text style={styles.systemText}>{msg.text}</Text>
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={[
                styles.msgBubbleWrap,
                isMe ? styles.myMsgWrap : styles.otherMsgWrap,
              ]}
            >
              <Text style={styles.senderLabel}>{msg.sender}</Text>
              <View
                style={[
                  styles.msgBubble,
                  isMe ? styles.myMsgBubble : styles.otherMsgBubble,
                ]}
              >
                <Text style={isMe ? styles.myMsgText : styles.otherMsgText}>
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Reactions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reactionBar}>
        {quickReactions.map((text, idx) => (
          <Pressable
            key={idx}
            onPress={() => onSendMessage(text)}
            style={styles.reactionChip}
          >
            <Text style={styles.reactionText}>{text}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Send match message..."
          placeholderTextColor="#71717A"
          style={styles.input}
        />
        <Pressable onPress={handleSend} style={styles.sendBtn}>
          <Send size={14} color="#000" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#131522",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1B1E2E",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  liveText: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  msgScroll: {
    maxHeight: 150,
  },
  msgContent: {
    padding: 10,
    gap: 6,
  },
  systemWrap: {
    alignSelf: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginVertical: 2,
  },
  systemText: {
    color: "#D4AF37",
    fontSize: 9,
    fontFamily: "monospace",
  },
  msgBubbleWrap: {
    maxWidth: "80%",
  },
  myMsgWrap: {
    alignSelf: "flex-end",
  },
  otherMsgWrap: {
    alignSelf: "flex-start",
  },
  senderLabel: {
    color: "#71717A",
    fontSize: 8,
    marginBottom: 2,
    marginHorizontal: 4,
  },
  msgBubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  myMsgBubble: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  otherMsgBubble: {
    backgroundColor: "#1C1F2E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  myMsgText: {
    color: "#FDE68A",
    fontSize: 11,
  },
  otherMsgText: {
    color: "#E4E4E7",
    fontSize: 11,
  },
  reactionBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#171926",
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.1)",
  },
  reactionChip: {
    backgroundColor: "#222536",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  reactionText: {
    color: "#D4D4D8",
    fontSize: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    backgroundColor: "#1B1E2E",
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
  },
  input: {
    flex: 1,
    backgroundColor: "#12141F",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#FFFFFF",
    fontSize: 11,
  },
  sendBtn: {
    backgroundColor: "#D4AF37",
    padding: 8,
    borderRadius: 10,
  },
});

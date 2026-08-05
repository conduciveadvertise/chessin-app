import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { tournamentRepository } from "../repositories/TournamentRepository";
import { PlayerReport, SystemAnnouncement } from "../types/tournament";
import { ShieldAlert, ChevronLeft } from "lucide-react-native";

interface AdminViewProps {
  onBackToHome: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToHome }) => {
  const [reports, setReports] = useState<PlayerReport[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);

  useEffect(() => {
    tournamentRepository.getPlayerReports().then(setReports);
    tournamentRepository.getAnnouncements().then(setAnnouncements);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Home</Text>
        </Pressable>

        <View style={styles.badge}>
          <ShieldAlert size={14} color="#FDA4AF" />
          <Text style={styles.badgeText}>Admin Panel</Text>
        </View>
      </View>

      <Text style={styles.title}>Fair Play Queue</Text>

      {reports.map((r) => (
        <View key={r.id} style={styles.reportCard}>
          <Text style={styles.reportReason}>Reason: {r.reason}</Text>
          <Text style={styles.reportName}>Target: {r.reportedName}</Text>
          <Text style={styles.reportDetails}>{r.details}</Text>
        </View>
      ))}

      <Text style={styles.title}>Announcements</Text>
      {announcements.map((a) => (
        <View key={a.id} style={styles.annCard}>
          <Text style={styles.annTitle}>{a.title}</Text>
          <Text style={styles.annContent}>{a.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  content: {
    padding: 16,
    paddingBottom: 80,
    gap: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exitBtnText: {
    color: "#E4E4E7",
    fontSize: 11,
    fontWeight: "bold",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(159, 18, 57, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(159, 18, 57, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: "#FDA4AF",
    fontSize: 10,
    fontWeight: "bold",
  },
  title: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
  },
  reportCard: {
    backgroundColor: "#0A0A0C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(159, 18, 57, 0.3)",
    padding: 12,
    gap: 4,
  },
  reportReason: {
    color: "#FDA4AF",
    fontSize: 10,
    fontWeight: "bold",
  },
  reportName: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  reportDetails: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  annCard: {
    backgroundColor: "#0A0A0C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    gap: 4,
  },
  annTitle: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "bold",
  },
  annContent: {
    color: "#A1A1AA",
    fontSize: 11,
  },
});

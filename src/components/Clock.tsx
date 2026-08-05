import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { soundManager } from "../services/sound";

interface ClockProps {
  initialTime: number; // seconds
  isActive: boolean;
  onTimeOut?: () => void;
  playerColor: "w" | "b";
  playerName: string;
  playerRating?: number;
  playerTitle?: string;
  avatar?: string;
}

export const Clock: React.FC<ClockProps> = ({
  initialTime,
  isActive,
  onTimeOut,
  playerColor,
  playerName,
  playerRating = 1500,
  playerTitle = "GM",
  avatar,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let timer: any = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onTimeOut) onTimeOut();
            return 0;
          }
          if (prev <= 10) {
            soundManager.playTimerTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeOut]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isLowTime = timeLeft <= 30 && timeLeft > 0;

  return (
    <View style={[styles.container, isActive ? styles.activeContainer : styles.inactiveContainer]}>
      {/* Player info */}
      <View style={styles.playerRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            }}
            style={styles.avatar}
          />
          <View
            style={[
              styles.colorDot,
              playerColor === "w" ? styles.whiteDot : styles.blackDot,
            ]}
          />
        </View>

        <View style={styles.metaCol}>
          <View style={styles.titleRow}>
            {Boolean(playerTitle) && (
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>{playerTitle}</Text>
              </View>
            )}
            <Text style={styles.playerName} numberOfLines={1}>
              {playerName}
            </Text>
          </View>
          <Text style={styles.playerRating}>Rating: {playerRating}</Text>
        </View>
      </View>

      {/* Time Display */}
      <View
        style={[
          styles.timeDisplay,
          isLowTime
            ? styles.lowTimeDisplay
            : isActive
            ? styles.activeTimeDisplay
            : styles.inactiveTimeDisplay,
        ]}
      >
        <Text
          style={[
            styles.timeText,
            isLowTime
              ? styles.lowTimeText
              : isActive
              ? styles.activeTimeText
              : styles.inactiveTimeText,
          ]}
        >
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 4,
  },
  activeContainer: {
    backgroundColor: "#0F1015",
    borderColor: "#D4AF37",
  },
  inactiveContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    opacity: 0.8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  colorDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000",
  },
  whiteDot: {
    backgroundColor: "#FFE898",
  },
  blackDot: {
    backgroundColor: "#1A150A",
  },
  metaCol: {
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  titleBadgeText: {
    color: "#D4AF37",
    fontSize: 8,
    fontWeight: "bold",
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    maxWidth: 120,
  },
  playerRating: {
    color: "#A1A1AA",
    fontSize: 10,
    marginTop: 2,
  },
  timeDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeTimeDisplay: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  inactiveTimeDisplay: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  lowTimeDisplay: {
    backgroundColor: "#881337",
    borderColor: "#F43F5E",
  },
  timeText: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  activeTimeText: {
    color: "#000000",
  },
  inactiveTimeText: {
    color: "#D4D4D8",
  },
  lowTimeText: {
    color: "#FB7185",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Chess } from "chess.js";
import {
  createMultiplayerRoom,
  joinMultiplayerRoom,
  matchmakeMultiplayer,
  fetchRoomState,
  sendRoomMove,
  sendRoomChat,
} from "../services/api";
import { multiplayerRepository } from "../repositories/MultiplayerRepository";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { Clock } from "../components/Clock";
import { MoveHistory } from "../components/MoveHistory";
import { MultiplayerChat } from "../components/MultiplayerChat";
import { GameSettings, UserProfile } from "../types/chess";
import {
  Swords,
  Users,
  Copy,
  Check,
  ChevronLeft,
  Eye,
  Flag,
  ShieldAlert,
} from "lucide-react-native";

interface PlayOnlineViewProps {
  user: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
}

export const PlayOnlineView: React.FC<PlayOnlineViewProps> = ({
  user,
  settings,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<"lobby" | "spectate">("lobby");
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [playerRole, setPlayerRole] = useState<"white" | "black" | "spectator">("white");
  const [roomCodeInput, setRoomCodeInput] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [timeCategory, setTimeCategory] = useState<"bullet" | "blitz" | "rapid" | "classical">("rapid");
  const [showFairPlayReport, setShowFairPlayReport] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>("");

  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (activeRoom) {
      interval = setInterval(async () => {
        try {
          const res = await fetchRoomState(activeRoom.id);
          if (res.room) {
            setActiveRoom(res.room);
            if (res.room.fen !== fen) {
              chess.load(res.room.fen);
              setFen(res.room.fen);
              setHistory(res.room.moves || []);
              if (res.room.moves && res.room.moves.length > 0) {
                soundManager.playMove();
              }
            }
          }
        } catch (e) {
          console.error("Room sync error", e);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [activeRoom, fen, chess]);

  const handleQuickMatch = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const tcMap = {
        bullet: { initial: 60, increment: 0 },
        blitz: { initial: 180, increment: 2 },
        rapid: { initial: 600, increment: 0 },
        classical: { initial: 900, increment: 10 },
      };

      const res = await matchmakeMultiplayer(user.name, user.rating[timeCategory] || 1500, tcMap[timeCategory]);
      if (res.room) {
        setActiveRoom(res.room);
        setPlayerRole((res as any).role || "white");
        chess.reset();
        setFen(chess.fen());
        setHistory([]);
      }
    } catch (e) {
      setErrorMessage("Matchmaking error. Try again.");
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await createMultiplayerRoom(user.name, user.rating[timeCategory] || 1500, {
        initial: 600,
        increment: 0,
      });
      if (res.room) {
        setActiveRoom(res.room);
        setPlayerRole("white");
        chess.reset();
        setFen(chess.fen());
        setHistory([]);
      }
    } catch (e) {
      setErrorMessage("Could not create room.");
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await joinMultiplayerRoom(roomCodeInput.trim(), user.name, user.rating.rapid);
      if (res.room) {
        setActiveRoom(res.room);
        setPlayerRole("black");
        chess.load(res.room.fen);
        setFen(res.room.fen);
        setHistory(res.room.moves || []);
      } else {
        setErrorMessage(res.error || "Room not found.");
      }
    } catch (e) {
      setErrorMessage("Could not join room.");
    }
    setLoading(false);
  };

  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!activeRoom || activeRoom.status !== "playing") return;

    const myTurn =
      (activeRoom.turn === "w" && playerRole === "white") ||
      (activeRoom.turn === "b" && playerRole === "black");
    if (!myTurn) return;

    try {
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (moveObj) {
        setFen(chess.fen());
        setHistory(chess.history());
        setLastMove({ from: moveObj.from, to: moveObj.to });

        if (moveObj.captured) soundManager.playCapture();
        else soundManager.playMove();

        const isCheckmate = chess.isCheckmate();
        const isDraw = chess.isDraw();

        const updated = await sendRoomMove(
          activeRoom.id,
          chess.fen(),
          moveObj.san,
          chess.pgn(),
          isCheckmate,
          isDraw
        );
        if (updated.room) setActiveRoom(updated.room);
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  };

  const handleResign = async () => {
    if (!activeRoom) return;
    const winnerId = playerRole === "white" ? activeRoom.blackPlayer?.id : activeRoom.whitePlayer?.id;
    await multiplayerRepository.pushMove(
      activeRoom.id,
      chess.fen(),
      "1-0",
      chess.pgn(),
      0,
      0,
      true,
      false
    );
    setActiveRoom((prev: any) => ({
      ...prev,
      status: "completed",
      winner_id: winnerId,
      win_reason: "resignation",
    }));
  };

  const handleSendChat = async (text: string) => {
    if (!activeRoom) return;
    const res = await sendRoomChat(activeRoom.id, user.name, text);
    if ((res as any)?.chatMessages) {
      setActiveRoom((prev: any) => ({ ...prev, chatMessages: (res as any).chatMessages }));
    }
  };

  const myColor = playerRole === "black" ? "b" : "w";
  const opponentColor = myColor === "w" ? "b" : "w";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => {
            setActiveRoom(null);
            onBackToHome();
          }}
          style={styles.exitBtn}
        >
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Arena</Text>
        </Pressable>

        {!activeRoom && (
          <View style={styles.tabToggle}>
            <Pressable
              onPress={() => setActiveTab("lobby")}
              style={[styles.tabBtn, activeTab === "lobby" && styles.activeTabBtn]}
            >
              <Text style={[styles.tabBtnText, activeTab === "lobby" && styles.activeTabBtnText]}>
                Play Arena
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("spectate")}
              style={[styles.tabBtn, activeTab === "spectate" && styles.activeTabBtn]}
            >
              <Text style={[styles.tabBtnText, activeTab === "spectate" && styles.activeTabBtnText]}>
                Spectate
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {!activeRoom ? (
        activeTab === "lobby" ? (
          <View style={styles.lobbyCard}>
            <Text style={styles.title}>Online Multiplayer</Text>
            <Text style={styles.sub}>Rated matchmaking & private invite rooms</Text>

            {Boolean(errorMessage) && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Time category selector */}
            <View>
              <Text style={styles.label}>TIME CATEGORY</Text>
              <View style={styles.tcGrid}>
                {[
                  { cat: "bullet", label: "1|0 Bullet" },
                  { cat: "blitz", label: "3|2 Blitz" },
                  { cat: "rapid", label: "10|0 Rapid" },
                  { cat: "classical", label: "15|10 Class" },
                ].map((tc) => (
                  <Pressable
                    key={tc.cat}
                    onPress={() => setTimeCategory(tc.cat as any)}
                    style={[styles.tcBtn, timeCategory === tc.cat && styles.activeTcBtn]}
                  >
                    <Text
                      style={[styles.tcBtnText, timeCategory === tc.cat && styles.activeTcBtnText]}
                    >
                      {tc.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Matchmaking options */}
            <View style={styles.optionsRow}>
              <View style={styles.optionBox}>
                <Swords size={24} color="#D4AF37" />
                <Text style={styles.optionTitle}>Quick Match</Text>
                <Text style={styles.optionBody}>
                  Pair with players around {user.rating[timeCategory] || 1500} ELO.
                </Text>
                <Pressable onPress={handleQuickMatch} disabled={loading} style={styles.primaryBtn}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Find Opponent</Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.optionBox}>
                <Users size={24} color="#D4AF37" />
                <Text style={styles.optionTitle}>Challenge Friend</Text>
                <Text style={styles.optionBody}>Generate a private 6-digit room code.</Text>
                <Pressable onPress={handleCreateRoom} disabled={loading} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Create Code</Text>
                </Pressable>
              </View>
            </View>

            {/* Join room code input */}
            <View style={styles.joinBox}>
              <Text style={styles.label}>ENTER ROOM CODE</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={roomCodeInput}
                  onChangeText={setRoomCodeInput}
                  placeholder="e.g. 849201"
                  placeholderTextColor="#71717A"
                  style={styles.input}
                />
                <Pressable onPress={handleJoinRoom} disabled={loading} style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Join</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.lobbyCard}>
            <Text style={styles.title}>Live Broadcasts</Text>
            <Text style={styles.sub}>Watch top master games in real time</Text>

            {[
              { title: "GM Praggnanandhaa vs GM Hikaru", eval: "+0.4", time: "3|0 Blitz" },
              { title: "GM Gukesh D. vs GM Magnus Carlsen", eval: "-0.2", time: "10|0 Rapid" },
              { title: "IM Vidit Gujrathi vs GM Arjun Erigaisi", eval: "+1.1", time: "5|3 Blitz" },
            ].map((g, idx) => (
              <View key={idx} style={styles.broadcastCard}>
                <View>
                  <Text style={styles.broadcastTitle}>{g.title}</Text>
                  <Text style={styles.broadcastMeta}>
                    {g.time} • Eval {g.eval}
                  </Text>
                </View>
                <Pressable onPress={handleQuickMatch} style={styles.watchBtn}>
                  <Text style={styles.watchBtnText}>Watch</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )
      ) : (
        /* Active Game Arena */
        <View style={styles.gameLayout}>
          {activeRoom.status === "waiting" && (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingTitle}>Waiting for opponent...</Text>
              <Text style={styles.waitingCode}>{activeRoom.code}</Text>
            </View>
          )}

          <Clock
            initialTime={opponentColor === "w" ? activeRoom.whiteTime : activeRoom.blackTime}
            isActive={activeRoom.turn === opponentColor && activeRoom.status === "playing"}
            playerColor={opponentColor}
            playerName={
              opponentColor === "w"
                ? activeRoom.whitePlayer?.name || "Waiting..."
                : activeRoom.blackPlayer?.name || "Waiting..."
            }
            playerTitle="GM"
            playerRating={
              opponentColor === "w"
                ? activeRoom.whitePlayer?.rating || 1500
                : activeRoom.blackPlayer?.rating || 1500
            }
          />

          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation={myColor}
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleMove}
              disabled={
                activeRoom.status !== "playing" ||
                (activeRoom.turn === "w" ? "white" : "black") !== playerRole
              }
              lastMove={lastMove}
            />
          </View>

          <Clock
            initialTime={myColor === "w" ? activeRoom.whiteTime : activeRoom.blackTime}
            isActive={activeRoom.turn === myColor && activeRoom.status === "playing"}
            playerColor={myColor}
            playerName={user.name}
            playerTitle={user.title}
            playerRating={user.rating[timeCategory] || 1500}
            avatar={user.avatar}
          />

          <View style={styles.actionRow}>
            <Pressable onPress={handleResign} style={styles.resignBtn}>
              <Flag size={14} color="#FDA4AF" />
              <Text style={styles.resignBtnText}>Resign</Text>
            </Pressable>
          </View>

          <MoveHistory history={history} />
          <MultiplayerChat
            messages={activeRoom.chatMessages || []}
            onSendMessage={handleSendChat}
            currentUser={user.name}
          />
        </View>
      )}
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
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 2,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTabBtn: {
    backgroundColor: "#D4AF37",
  },
  tabBtnText: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeTabBtnText: {
    color: "#000",
  },
  lobbyCard: {
    backgroundColor: "#0A0A0C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    gap: 16,
  },
  title: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  sub: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "rgba(159, 18, 57, 0.8)",
    padding: 10,
    borderRadius: 12,
  },
  errorText: {
    color: "#FDA4AF",
    fontSize: 11,
    textAlign: "center",
  },
  label: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tcGrid: {
    flexDirection: "row",
    gap: 6,
  },
  tcBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  activeTcBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  tcBtnText: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeTcBtnText: {
    color: "#D4AF37",
  },
  optionsRow: {
    gap: 12,
  },
  optionBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  optionBody: {
    color: "#A1A1AA",
    fontSize: 11,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  secondaryBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 12,
  },
  joinBox: {
    gap: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 12,
  },
  joinBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  joinBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  broadcastCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 14,
    marginVertical: 4,
  },
  broadcastTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  broadcastMeta: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  watchBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  watchBtnText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  gameLayout: {
    gap: 12,
  },
  waitingCard: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  waitingTitle: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  waitingCode: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  resignBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(159, 18, 57, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resignBtnText: {
    color: "#FDA4AF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

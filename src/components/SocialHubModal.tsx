import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  X,
  Users,
  UserPlus,
  MessageSquare,
  Swords,
  Bell,
  Search,
  Check,
  Ban,
  ShieldAlert,
  Send,
  Trash2,
} from "lucide-react-native";
import { useSocialStore } from "../services/socialStore";
import { useAuth } from "../services/authService";
import { DbProfile } from "../types/auth";

interface SocialHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchMatch?: (timeControl: string, mode: string, opponent: DbProfile) => void;
}

export const SocialHubModal: React.FC<SocialHubModalProps> = ({ isOpen, onClose, onLaunchMatch }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || "";

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    blockedUsers,
    presenceMap,
    activeConversation,
    messages,
    typingUsers,
    matchInvites,
    notifications,
    unreadNotificationCount,
    isSearching,
    fetchInitialData,
    searchUsers,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    removeFriend,
    unblockUser,
    reportUser,
    openChatWithUser,
    sendMessage,
    setTyping,
    deleteMessageForMe,
    sendMatchInvite,
    respondMatchInvite,
    markNotificationRead,
    deleteNotification,
    subscribeToRealtime,
  } = useSocialStore();

  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "search" | "chat" | "invites" | "notifications" | "blocked"
  >("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFriendForChat, setSelectedFriendForChat] = useState<DbProfile | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportingUser, setReportingUser] = useState<DbProfile | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUserId) {
      fetchInitialData(currentUserId);
      const unsubscribe = subscribeToRealtime(currentUserId);
      return () => unsubscribe();
    }
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  const showNotificationBanner = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSearchSubmit = () => {
    if (currentUserId && searchQuery.trim()) {
      searchUsers(searchQuery, currentUserId);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !currentUserId) return;

    const text = messageInput.trim();
    setMessageInput("");
    setTyping(activeConversation.id, currentUserId, false);

    await sendMessage(activeConversation.id, currentUserId, text);
  };

  const handleInputChange = (text: string) => {
    setMessageInput(text);
    if (activeConversation && currentUserId) {
      setTyping(activeConversation.id, currentUserId, text.length > 0);
    }
  };

  const handleOpenChat = async (friendProfile: DbProfile) => {
    setSelectedFriendForChat(friendProfile);
    setActiveTab("chat");
    if (currentUserId) {
      await openChatWithUser(currentUserId, friendProfile.id);
    }
  };

  const handleSendChallenge = async (friendProfile: DbProfile) => {
    if (!currentUserId) return;
    const ok = await sendMatchInvite(currentUserId, friendProfile.id, "10+0", "rated");
    if (ok) {
      showNotificationBanner(`Match challenge sent to ${friendProfile.display_name}!`);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportingUser || !reportReason.trim() || !currentUserId) return;

    const ok = await reportUser(currentUserId, reportingUser.id, reportReason.trim());
    if (ok) {
      showNotificationBanner(`Report submitted against ${reportingUser.display_name}.`);
      setReportingUser(null);
      setReportReason("");
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <Users size={18} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Social Network</Text>
                <Text style={styles.headerSub}>Friends, Chat & Match Challenges</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={16} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Action Success Alert */}
          {Boolean(actionSuccess) && (
            <View style={styles.alertBanner}>
              <Check size={14} color="#34D399" />
              <Text style={styles.alertText}>{actionSuccess}</Text>
            </View>
          )}

          {/* Horizontal Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {[
              { id: "friends", label: `Friends (${friends.length})`, icon: Users },
              { id: "requests", label: "Requests", icon: UserPlus },
              { id: "search", label: "Find Players", icon: Search },
              { id: "invites", label: `Invites (${matchInvites.length})`, icon: Swords },
              {
                id: "notifications",
                label: `Notifs ${unreadNotificationCount > 0 ? `(${unreadNotificationCount})` : ""}`,
                icon: Bell,
              },
              { id: "blocked", label: "Security", icon: Ban },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                >
                  <IconComp size={12} color={isActive ? "#000" : "#A1A1AA"} />
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Tab Content */}
          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentInner}>
            {/* Friends Tab */}
            {activeTab === "friends" && (
              <View style={styles.sectionGap}>
                {friends.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Users size={32} color="#52525B" />
                    <Text style={styles.emptyText}>
                      No friends added yet. Use "Find Players" to build your network!
                    </Text>
                  </View>
                ) : (
                  friends.map((f) => {
                    const profile = f.profile;
                    if (!profile) return null;
                    const presence =
                      presenceMap[profile.id]?.status || profile.online_status || "offline";

                    return (
                      <View key={f.id} style={styles.userCard}>
                        <View style={styles.userInfoRow}>
                          <View style={styles.avatarWrap}>
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                            <View
                              style={[
                                styles.statusDot,
                                presence === "online"
                                  ? styles.onlineDot
                                  : presence === "in_match"
                                  ? styles.matchDot
                                  : styles.offlineDot,
                              ]}
                            />
                          </View>
                          <View>
                            <View style={styles.nameRow}>
                              <Text style={styles.userName}>{profile.display_name}</Text>
                              <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{profile.rating}</Text>
                              </View>
                            </View>
                            <Text style={styles.userStatus}>
                              {presence === "online"
                                ? "Online"
                                : presence === "in_match"
                                ? "In Match"
                                : "Offline"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardActions}>
                          <Pressable
                            onPress={() => handleOpenChat(profile)}
                            style={styles.actionIconBtn}
                          >
                            <MessageSquare size={14} color="#D4AF37" />
                          </Pressable>
                          <Pressable
                            onPress={() => handleSendChallenge(profile)}
                            style={styles.actionIconBtn}
                          >
                            <Swords size={14} color="#D4AF37" />
                          </Pressable>
                          <Pressable
                            onPress={() => currentUserId && removeFriend(currentUserId, profile.id)}
                            style={styles.actionIconBtn}
                          >
                            <Trash2 size={14} color="#F87171" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionTitle}>
                  Incoming Requests ({incomingRequests.length})
                </Text>
                {incomingRequests.length === 0 ? (
                  <Text style={styles.subtleText}>No pending incoming friend requests.</Text>
                ) : (
                  incomingRequests.map((req) => (
                    <View key={req.id} style={styles.userCard}>
                      <View style={styles.userInfoRow}>
                        <Image
                          source={{ uri: req.sender_profile?.avatar_url }}
                          style={styles.avatarSmall}
                        />
                        <View>
                          <Text style={styles.userName}>{req.sender_profile?.display_name}</Text>
                          <Text style={styles.userStatus}>
                            {req.sender_profile?.rating} ELO
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardActions}>
                        <Pressable
                          onPress={() =>
                            currentUserId &&
                            respondToFriendRequest(req.id, currentUserId, "accept")
                          }
                          style={styles.acceptPill}
                        >
                          <Text style={styles.acceptPillText}>Accept</Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            currentUserId &&
                            respondToFriendRequest(req.id, currentUserId, "reject")
                          }
                          style={styles.rejectPill}
                        >
                          <Text style={styles.rejectPillText}>Reject</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}

                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                  Sent Requests ({outgoingRequests.length})
                </Text>
                {outgoingRequests.length === 0 ? (
                  <Text style={styles.subtleText}>No pending outgoing requests.</Text>
                ) : (
                  outgoingRequests.map((req) => (
                    <View key={req.id} style={styles.userCard}>
                      <View style={styles.userInfoRow}>
                        <Image
                          source={{ uri: req.receiver_profile?.avatar_url }}
                          style={styles.avatarSmall}
                        />
                        <View>
                          <Text style={styles.userName}>
                            {req.receiver_profile?.display_name}
                          </Text>
                          <Text style={styles.userStatus}>Pending response</Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => cancelFriendRequest(req.id)}
                        style={styles.rejectPill}
                      >
                        <Text style={styles.rejectPillText}>Cancel</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Find Players / Search Tab */}
            {activeTab === "search" && (
              <View style={styles.sectionGap}>
                <View style={styles.searchForm}>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search player name or username..."
                    placeholderTextColor="#71717A"
                    style={styles.searchInput}
                  />
                  <Pressable onPress={handleSearchSubmit} style={styles.searchBtn}>
                    {isSearching ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.searchBtnText}>Search</Text>
                    )}
                  </Pressable>
                </View>

                {searchResults.map((player) => (
                  <View key={player.id} style={styles.userCard}>
                    <View style={styles.userInfoRow}>
                      <Image source={{ uri: player.avatar_url }} style={styles.avatarSmall} />
                      <View>
                        <Text style={styles.userName}>{player.display_name}</Text>
                        <Text style={styles.userStatus}>
                          {player.rating} ELO • {player.country}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={async () => {
                        if (currentUserId) {
                          const ok = await sendFriendRequest(currentUserId, player.id);
                          if (ok)
                            showNotificationBanner(
                              `Friend request sent to ${player.display_name}!`
                            );
                        }
                      }}
                      style={styles.addFriendPill}
                    >
                      <UserPlus size={12} color="#000" />
                      <Text style={styles.addFriendPillText}>Add</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <View style={styles.sectionGap}>
                {selectedFriendForChat && (
                  <View style={styles.chatHeader}>
                    <Image
                      source={{ uri: selectedFriendForChat.avatar_url }}
                      style={styles.avatarSmall}
                    />
                    <Text style={styles.userName}>{selectedFriendForChat.display_name}</Text>
                  </View>
                )}

                <ScrollView style={styles.chatStream}>
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.chatBubble,
                          isMine ? styles.myChatBubble : styles.otherChatBubble,
                        ]}
                      >
                        <Text style={isMine ? styles.myChatText : styles.otherChatText}>
                          {msg.text}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>

                {Boolean(selectedFriendForChat && typingUsers[selectedFriendForChat.id]) && (
                  <Text style={styles.typingText}>
                    {selectedFriendForChat?.display_name} is typing...
                  </Text>
                )}

                <View style={styles.chatInputRow}>
                  <TextInput
                    value={messageInput}
                    onChangeText={handleInputChange}
                    placeholder="Type a message..."
                    placeholderTextColor="#71717A"
                    style={styles.chatInput}
                  />
                  <Pressable onPress={handleSendMessage} style={styles.sendBtn}>
                    <Send size={14} color="#000" />
                  </Pressable>
                </View>
              </View>
            )}

            {/* Match Invites Tab */}
            {activeTab === "invites" && (
              <View style={styles.sectionGap}>
                {matchInvites.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Swords size={32} color="#52525B" />
                    <Text style={styles.emptyText}>No active match invitations.</Text>
                  </View>
                ) : (
                  matchInvites.map((inv) => (
                    <View key={inv.id} style={styles.userCard}>
                      <View style={styles.userInfoRow}>
                        <Image
                          source={{ uri: inv.sender_profile?.avatar_url }}
                          style={styles.avatarSmall}
                        />
                        <View>
                          <Text style={styles.userName}>
                            {inv.sender_profile?.display_name}
                          </Text>
                          <Text style={styles.goldStatus}>
                            Challenged you ({inv.time_control} {inv.mode})
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardActions}>
                        <Pressable
                          onPress={async () => {
                            const ok = await respondMatchInvite(inv.id, "accepted");
                            if (ok && onLaunchMatch && inv.sender_profile) {
                              onLaunchMatch(inv.time_control, inv.mode, inv.sender_profile);
                              onClose();
                            }
                          }}
                          style={styles.acceptPill}
                        >
                          <Text style={styles.acceptPillText}>Accept</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => respondMatchInvite(inv.id, "rejected")}
                          style={styles.rejectPill}
                        >
                          <Text style={styles.rejectPillText}>Decline</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <View style={styles.sectionGap}>
                {notifications.length === 0 ? (
                  <Text style={styles.subtleText}>No notifications.</Text>
                ) : (
                  notifications.map((n) => (
                    <View key={n.id} style={styles.notifCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.notifTitle}>{n.title}</Text>
                        <Text style={styles.notifBody}>{n.message}</Text>
                      </View>
                      <Pressable onPress={() => deleteNotification(n.id)}>
                        <Trash2 size={14} color="#71717A" />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Security Tab */}
            {activeTab === "blocked" && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionTitle}>Blocked Players ({blockedUsers.length})</Text>
                {blockedUsers.map((b) => (
                  <View key={b.id} style={styles.userCard}>
                    <Text style={styles.userName}>{b.display_name}</Text>
                    <Pressable
                      onPress={() => currentUserId && unblockUser(currentUserId, b.id)}
                      style={styles.rejectPill}
                    >
                      <Text style={styles.rejectPillText}>Unblock</Text>
                    </Pressable>
                  </View>
                ))}

                <View style={styles.reportBox}>
                  <Text style={styles.reportTitle}>Report Unfair Play</Text>
                  <TextInput
                    value={reportReason}
                    onChangeText={setReportReason}
                    placeholder="Reason for report..."
                    placeholderTextColor="#71717A"
                    style={styles.reportInput}
                  />
                  <Pressable onPress={handleReportSubmit} style={styles.reportBtn}>
                    <Text style={styles.reportBtnText}>Submit Report</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
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
    padding: 16,
  },
  card: {
    backgroundColor: "#0A0A0C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSub: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(6, 78, 59, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
  },
  alertText: {
    color: "#34D399",
    fontSize: 11,
  },
  tabsScroll: {
    flexDirection: "row",
    marginVertical: 10,
    maxHeight: 38,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 6,
  },
  activeTabBtn: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#000000",
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    paddingVertical: 6,
  },
  sectionGap: {
    gap: 10,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: "#71717A",
    fontSize: 12,
    textAlign: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 10,
  },
  userInfoRow: {
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
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#000",
  },
  onlineDot: { backgroundColor: "#10B981" },
  matchDot: { backgroundColor: "#F59E0B" },
  offlineDot: { backgroundColor: "#52525B" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  ratingBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
  },
  userStatus: {
    color: "#A1A1AA",
    fontSize: 10,
    marginTop: 2,
  },
  goldStatus: {
    color: "#D4AF37",
    fontSize: 10,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 8,
    borderRadius: 10,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
  },
  subtleText: {
    color: "#71717A",
    fontSize: 11,
  },
  acceptPill: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  acceptPillText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
  },
  rejectPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rejectPillText: {
    color: "#F87171",
    fontWeight: "bold",
    fontSize: 10,
  },
  searchForm: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 12,
  },
  searchBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 12,
  },
  searchBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 11,
  },
  addFriendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addFriendPillText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  chatStream: {
    maxHeight: 200,
    marginVertical: 8,
  },
  chatBubble: {
    padding: 8,
    borderRadius: 10,
    marginVertical: 3,
    maxWidth: "80%",
  },
  myChatBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#D4AF37",
  },
  otherChatBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  myChatText: { color: "#000", fontSize: 11 },
  otherChatText: { color: "#FFF", fontSize: 11 },
  typingText: {
    color: "#D4AF37",
    fontSize: 9,
    fontStyle: "italic",
  },
  chatInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#FFF",
    fontSize: 11,
  },
  sendBtn: {
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 12,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 12,
  },
  notifTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  notifBody: {
    color: "#A1A1AA",
    fontSize: 10,
    marginTop: 2,
  },
  reportBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(225, 29, 72, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.3)",
    borderRadius: 14,
    gap: 8,
  },
  reportTitle: {
    color: "#F87171",
    fontWeight: "bold",
    fontSize: 12,
  },
  reportInput: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 8,
    color: "#FFF",
    fontSize: 11,
  },
  reportBtn: {
    backgroundColor: "#E11D48",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  reportBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 11,
  },
});

import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { socialRepository } from "../repositories/SocialRepository";
import { chatRepository } from "../repositories/ChatRepository";
import { matchInviteRepository } from "../repositories/MatchInviteRepository";
import { presenceRepository } from "../repositories/PresenceRepository";
import { notificationRepository } from "../repositories/NotificationRepository";
import { DbProfile, DbNotification } from "../types/auth";
import {
  FriendRequest,
  FriendRelation,
  ChatMessage,
  MatchInvite,
  UserPresence,
  Conversation,
} from "../types/social";

interface SocialState {
  // Friends & Requests
  friends: FriendRelation[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  searchResults: DbProfile[];
  blockedUsers: DbProfile[];
  
  // Realtime Presence Map
  presenceMap: Record<string, UserPresence>;

  // Chat & Messages
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  typingUsers: Record<string, boolean>;

  // Invites
  matchInvites: MatchInvite[];

  // Notifications
  notifications: DbNotification[];
  unreadNotificationCount: number;

  // UI state
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  // Actions
  fetchInitialData: (userId: string) => Promise<void>;
  searchUsers: (query: string, currentUserId: string) => Promise<void>;
  sendFriendRequest: (senderId: string, receiverId: string) => Promise<boolean>;
  respondToFriendRequest: (requestId: string, currentUserId: string, action: "accept" | "reject") => Promise<boolean>;
  cancelFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (userId: string, friendId: string) => Promise<boolean>;
  blockUser: (userId: string, targetUserId: string) => Promise<boolean>;
  unblockUser: (userId: string, targetUserId: string) => Promise<boolean>;
  reportUser: (reporterId: string, reportedUserId: string, reason: string) => Promise<boolean>;

  // Chat Actions
  openChatWithUser: (currentUserId: string, targetUserId: string) => Promise<void>;
  sendMessage: (conversationId: string, senderId: string, text?: string, imageUrl?: string) => Promise<boolean>;
  markMessagesSeen: (conversationId: string, userId: string) => Promise<void>;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => Promise<void>;
  deleteMessageForMe: (messageId: string, userId: string) => Promise<boolean>;

  // Match Invites
  sendMatchInvite: (senderId: string, receiverId: string, timeControl?: string, mode?: string) => Promise<boolean>;
  respondMatchInvite: (inviteId: string, action: "accepted" | "rejected" | "cancelled") => Promise<boolean>;

  // Presence
  updatePresence: (userId: string, status: "online" | "offline" | "in_match" | "in_analysis" | "idle") => Promise<void>;

  // Notifications
  markNotificationRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // Realtime
  subscribeToRealtime: (userId: string) => () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  searchResults: [],
  blockedUsers: [],
  presenceMap: {},

  activeConversation: null,
  messages: [],
  typingUsers: {},

  matchInvites: [],
  notifications: [],
  unreadNotificationCount: 0,

  isLoading: false,
  isSearching: false,
  error: null,

  fetchInitialData: async (userId: string) => {
    if (!userId || !isSupabaseConfigured) return;
    set({ isLoading: true, error: null });

    try {
      const [friends, pending, invites, notifs, blocked] = await Promise.all([
        socialRepository.getFriends(userId),
        socialRepository.getPendingRequests(userId),
        matchInviteRepository.getActiveInvites(userId),
        notificationRepository.getNotifications(userId),
        socialRepository.getBlockedUsers(userId),
      ]);

      const friendIds = friends.map((f) => f.friend_id);
      const presences = await presenceRepository.getPresenceForUsers(friendIds);

      const unreadCount = notifs.filter((n) => !n.read).length;

      set({
        friends,
        incomingRequests: pending.incoming,
        outgoingRequests: pending.outgoing,
        matchInvites: invites,
        notifications: notifs,
        unreadNotificationCount: unreadCount,
        blockedUsers: blocked.map((b) => b.blocked_profile).filter(Boolean) as DbProfile[],
        presenceMap: presences,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Fetch initial social data failed:", err);
      set({ isLoading: false, error: err.message });
    }
  },

  searchUsers: async (query: string, currentUserId: string) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    try {
      const results = await socialRepository.searchUsers(query, currentUserId);
      set({ searchResults: results, isSearching: false });
    } catch (err) {
      set({ isSearching: false });
    }
  },

  sendFriendRequest: async (senderId: string, receiverId: string) => {
    try {
      const req = await socialRepository.sendFriendRequest(senderId, receiverId);
      if (req) {
        set((state) => ({
          outgoingRequests: [...state.outgoingRequests, req],
        }));
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  respondToFriendRequest: async (requestId: string, currentUserId: string, action: "accept" | "reject") => {
    try {
      const ok = await socialRepository.respondToFriendRequest(requestId, currentUserId, action);
      if (ok) {
        set((state) => ({
          incomingRequests: state.incomingRequests.filter((r) => r.id !== requestId),
        }));
        // Refresh friends if accepted
        if (action === "accept") {
          get().fetchInitialData(currentUserId);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  cancelFriendRequest: async (requestId: string) => {
    const ok = await socialRepository.cancelFriendRequest(requestId);
    if (ok) {
      set((state) => ({
        outgoingRequests: state.outgoingRequests.filter((r) => r.id !== requestId),
      }));
    }
    return ok;
  },

  removeFriend: async (userId: string, friendId: string) => {
    const ok = await socialRepository.removeFriend(userId, friendId);
    if (ok) {
      set((state) => ({
        friends: state.friends.filter((f) => f.friend_id !== friendId),
      }));
    }
    return ok;
  },

  blockUser: async (userId: string, targetUserId: string) => {
    const ok = await socialRepository.blockUser(userId, targetUserId);
    if (ok) {
      get().fetchInitialData(userId);
    }
    return ok;
  },

  unblockUser: async (userId: string, targetUserId: string) => {
    const ok = await socialRepository.unblockUser(userId, targetUserId);
    if (ok) {
      set((state) => ({
        blockedUsers: state.blockedUsers.filter((u) => u.id !== targetUserId),
      }));
    }
    return ok;
  },

  reportUser: async (reporterId: string, reportedUserId: string, reason: string) => {
    return await socialRepository.reportUser(reporterId, reportedUserId, reason);
  },

  openChatWithUser: async (currentUserId: string, targetUserId: string) => {
    set({ isLoading: true });
    try {
      const conv = await chatRepository.getOrCreateConversation(currentUserId, targetUserId);
      if (conv) {
        const msgs = await chatRepository.getMessages(conv.id);
        await chatRepository.markMessagesSeen(conv.id, currentUserId);
        set({
          activeConversation: conv,
          messages: msgs,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId: string, senderId: string, text?: string, imageUrl?: string) => {
    try {
      const msg = await chatRepository.sendMessage(conversationId, senderId, text, imageUrl);
      if (msg) {
        set((state) => ({
          messages: [...state.messages, msg],
        }));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  markMessagesSeen: async (conversationId: string, userId: string) => {
    await chatRepository.markMessagesSeen(conversationId, userId);
  },

  setTyping: async (conversationId: string, userId: string, isTyping: boolean) => {
    await chatRepository.setTypingStatus(conversationId, userId, isTyping);
  },

  deleteMessageForMe: async (messageId: string, userId: string) => {
    const ok = await chatRepository.deleteMessageForMe(messageId, userId);
    if (ok) {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
    }
    return ok;
  },

  sendMatchInvite: async (senderId: string, receiverId: string, timeControl = "10+0", mode = "rated") => {
    try {
      const invite = await matchInviteRepository.sendInvite(senderId, receiverId, timeControl, mode);
      return Boolean(invite);
    } catch (err) {
      return false;
    }
  },

  respondMatchInvite: async (inviteId: string, action: "accepted" | "rejected" | "cancelled") => {
    const ok = await matchInviteRepository.respondInvite(inviteId, action);
    if (ok) {
      set((state) => ({
        matchInvites: state.matchInvites.filter((i) => i.id !== inviteId),
      }));
    }
    return ok;
  },

  updatePresence: async (userId: string, status) => {
    await presenceRepository.updatePresence(userId, status);
  },

  markNotificationRead: async (notificationId: string) => {
    const ok = await notificationRepository.markAsRead(notificationId);
    if (ok) {
      set((state) => {
        const notifs = state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        return {
          notifications: notifs,
          unreadNotificationCount: notifs.filter((n) => !n.read).length,
        };
      });
    }
  },

  deleteNotification: async (notificationId: string) => {
    const ok = await notificationRepository.deleteNotification(notificationId);
    if (ok) {
      set((state) => {
        const notifs = state.notifications.filter((n) => n.id !== notificationId);
        return {
          notifications: notifs,
          unreadNotificationCount: notifs.filter((n) => !n.read).length,
        };
      });
    }
  },

  subscribeToRealtime: (userId: string) => {
    if (!isSupabaseConfigured || !userId) return () => {};

    // Initial presence ping
    get().updatePresence(userId, "online");

    const channel = supabase
      .channel(`user_social_${userId}`)
      // Friend Requests realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests" },
        () => {
          get().fetchInitialData(userId);
        }
      )
      // Messages realtime
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          const active = get().activeConversation;
          if (active && active.id === newMsg.conversation_id) {
            set((state) => ({
              messages: [...state.messages, newMsg],
            }));
            chatRepository.markMessagesSeen(active.id, userId);
          }
        }
      )
      // Match Invites realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_invites" },
        () => {
          get().fetchInitialData(userId);
        }
      )
      // Notifications realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          get().fetchInitialData(userId);
        }
      )
      // Typing status realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_status" },
        (payload: any) => {
          const { conversation_id, user_id, is_typing } = payload.new || {};
          const active = get().activeConversation;
          if (active && active.id === conversation_id && user_id !== userId) {
            set((state) => ({
              typingUsers: { ...state.typingUsers, [user_id]: is_typing },
            }));
          }
        }
      )
      // Presence realtime
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presence" },
        (payload: any) => {
          const presence = payload.new as UserPresence;
          if (presence) {
            set((state) => ({
              presenceMap: { ...state.presenceMap, [presence.user_id]: presence },
            }));
          }
        }
      )
      .subscribe();

    // Heartbeat every 30s to keep presence updated
    const interval = setInterval(() => {
      get().updatePresence(userId, "online");
    }, 30000);

    return () => {
      clearInterval(interval);
      get().updatePresence(userId, "offline");
      supabase.removeChannel(channel);
    };
  },
}));

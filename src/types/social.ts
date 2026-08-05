import { DbProfile } from "./auth";

export type FriendRequestStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type MatchInviteStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";
export type PresenceStatus = "online" | "offline" | "in_match" | "in_analysis" | "idle";
export type MessageStatus = "sent" | "delivered" | "seen";

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendRequestStatus;
  created_at: string;
  updated_at: string;
  sender_profile?: DbProfile;
  receiver_profile?: DbProfile;
}

export interface FriendRelation {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  profile?: DbProfile;
  presence?: UserPresence;
  mutual_friends_count?: number;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants?: DbProfile[];
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text?: string;
  image_url?: string;
  status: MessageStatus;
  deleted_by_users?: string[];
  created_at: string;
  sender_profile?: DbProfile;
}

export interface MatchInvite {
  id: string;
  sender_id: string;
  receiver_id: string;
  time_control: string;
  mode: string;
  status: MatchInviteStatus;
  created_at: string;
  expires_at: string;
  sender_profile?: DbProfile;
}

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen: string;
  updated_at: string;
}

export interface TypingStatus {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export interface NotificationPreference {
  user_id: string;
  friend_requests: boolean;
  match_invites: boolean;
  messages: boolean;
  daily_puzzle: boolean;
  updated_at: string;
}

export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_user_id: string;
  created_at: string;
  blocked_profile?: DbProfile;
}

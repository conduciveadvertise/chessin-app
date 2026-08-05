import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { DbProfile } from "../types/auth";
import { FriendRequest, FriendRelation, BlockedUser } from "../types/social";

export class SocialRepository {
  /**
   * Search users by display name or username
   */
  async searchUsers(query: string, currentUserId?: string): Promise<DbProfile[]> {
    if (!isSupabaseConfigured || !query.trim()) return [];

    try {
      let req = supabase
        .from("profiles")
        .select("*")
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(20);

      if (currentUserId) {
        req = req.neq("id", currentUserId);
      }

      const { data, error } = await req;
      if (error) throw error;
      return (data as DbProfile[]) || [];
    } catch (err) {
      console.error("Search users failed:", err);
      return [];
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: "pending",
        })
        .select(`
          *,
          sender_profile:profiles!friend_requests_sender_id_fkey(*),
          receiver_profile:profiles!friend_requests_receiver_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Send notification to receiver
      await supabase.from("notifications").insert({
        user_id: receiverId,
        title: "New Friend Request",
        message: `You received a friend request!`,
        type: "friend_request",
      });

      return data as FriendRequest;
    } catch (err) {
      console.error("Send friend request failed:", err);
      throw err;
    }
  }

  /**
   * Respond to friend request (accept or reject)
   */
  async respondToFriendRequest(requestId: string, currentUserId: string, action: "accept" | "reject"): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      // Fetch request first
      const { data: request, error: fetchErr } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchErr || !request) throw new Error("Request not found");

      if (action === "accept") {
        // Update request status
        await supabase
          .from("friend_requests")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", requestId);

        // Add to friends table for both sides
        await supabase.from("friends").upsert([
          { user_id: request.sender_id, friend_id: request.receiver_id },
          { user_id: request.receiver_id, friend_id: request.sender_id },
        ]);

        // Send acceptance notification to original sender
        await supabase.from("notifications").insert({
          user_id: request.sender_id,
          title: "Friend Request Accepted",
          message: `Your friend request was accepted!`,
          type: "friend_accepted",
        });
      } else {
        await supabase
          .from("friend_requests")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", requestId);
      }

      return true;
    } catch (err) {
      console.error("Respond friend request error:", err);
      throw err;
    }
  }

  /**
   * Cancel outgoing friend request
   */
  async cancelFriendRequest(requestId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Cancel friend request failed:", err);
      return false;
    }
  }

  /**
   * List pending friend requests (incoming and outgoing)
   */
  async getPendingRequests(userId: string): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> {
    if (!isSupabaseConfigured) return { incoming: [], outgoing: [] };

    try {
      const { data: incomingData, error: incErr } = await supabase
        .from("friend_requests")
        .select(`
          *,
          sender_profile:profiles!friend_requests_sender_id_fkey(*)
        `)
        .eq("receiver_id", userId)
        .eq("status", "pending");

      if (incErr) throw incErr;

      const { data: outgoingData, error: outErr } = await supabase
        .from("friend_requests")
        .select(`
          *,
          receiver_profile:profiles!friend_requests_receiver_id_fkey(*)
        `)
        .eq("sender_id", userId)
        .eq("status", "pending");

      if (outErr) throw outErr;

      return {
        incoming: (incomingData as FriendRequest[]) || [],
        outgoing: (outgoingData as FriendRequest[]) || [],
      };
    } catch (err) {
      console.error("Get pending requests error:", err);
      return { incoming: [], outgoing: [] };
    }
  }

  /**
   * Fetch user's friends list
   */
  async getFriends(userId: string): Promise<FriendRelation[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          profile:profiles!friends_friend_id_fkey(*)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return (data as FriendRelation[]) || [];
    } catch (err) {
      console.error("Get friends error:", err);
      return [];
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Remove friend error:", err);
      return false;
    }
  }

  /**
   * Block user
   */
  async blockUser(userId: string, targetUserId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      // Remove friendship if exists
      await this.removeFriend(userId, targetUserId);

      const { error } = await supabase
        .from("blocked_users")
        .insert({
          user_id: userId,
          blocked_user_id: targetUserId,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Block user error:", err);
      return false;
    }
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string, targetUserId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("user_id", userId)
        .eq("blocked_user_id", targetUserId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Unblock user error:", err);
      return false;
    }
  }

  /**
   * List blocked users
   */
  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select(`
          *,
          blocked_profile:profiles!blocked_users_blocked_user_id_fkey(*)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return (data as BlockedUser[]) || [];
    } catch (err) {
      console.error("Get blocked users error:", err);
      return [];
    }
  }

  /**
   * Report user
   */
  async reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("reports")
        .insert({
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          reason,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Report user error:", err);
      return false;
    }
  }
}

export const socialRepository = new SocialRepository();

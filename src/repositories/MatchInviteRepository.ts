import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { MatchInvite } from "../types/social";

export class MatchInviteRepository {
  /**
   * Send a match invite to a friend
   */
  async sendInvite(senderId: string, receiverId: string, timeControl: string = "10+0", mode: string = "rated"): Promise<MatchInvite | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 minutes timeout

      const { data, error } = await supabase
        .from("match_invites")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          time_control: timeControl,
          mode,
          status: "pending",
          expires_at: expiresAt,
        })
        .select(`
          *,
          sender_profile:profiles!match_invites_sender_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: receiverId,
        title: "Match Challenge!",
        message: `You received a ${timeControl} match challenge!`,
        type: "match_invite",
      });

      return data as MatchInvite;
    } catch (err) {
      console.error("Send match invite error:", err);
      throw err;
    }
  }

  /**
   * Respond to match invite (accept, reject, cancel)
   */
  async respondInvite(inviteId: string, status: "accepted" | "rejected" | "cancelled"): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("match_invites")
        .update({ status })
        .eq("id", inviteId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Respond invite error:", err);
      return false;
    }
  }

  /**
   * Fetch active pending invites for user
   */
  async getActiveInvites(userId: string): Promise<MatchInvite[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from("match_invites")
        .select(`
          *,
          sender_profile:profiles!match_invites_sender_id_fkey(*)
        `)
        .eq("receiver_id", userId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString());

      if (error) throw error;
      return (data as MatchInvite[]) || [];
    } catch (err) {
      console.error("Get active invites error:", err);
      return [];
    }
  }
}

export const matchInviteRepository = new MatchInviteRepository();

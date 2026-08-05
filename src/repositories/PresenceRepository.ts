import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { UserPresence, PresenceStatus } from "../types/social";

export class PresenceRepository {
  /**
   * Update user presence status and timestamp
   */
  async updatePresence(userId: string, status: PresenceStatus): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      const now = new Date().toISOString();
      await supabase.from("presence").upsert({
        user_id: userId,
        status,
        last_seen: now,
        updated_at: now,
      });

      // Also update profiles table online status
      await supabase.from("profiles").update({
        online_status: status,
        last_seen: now,
      }).eq("id", userId);
    } catch (err) {
      console.error("Update presence error:", err);
    }
  }

  /**
   * Fetch presence for a list of user IDs
   */
  async getPresenceForUsers(userIds: string[]): Promise<Record<string, UserPresence>> {
    if (!isSupabaseConfigured || userIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from("presence")
        .select("*")
        .in("user_id", userIds);

      if (error) throw error;

      const map: Record<string, UserPresence> = {};
      (data || []).forEach((item: UserPresence) => {
        map[item.user_id] = item;
      });
      return map;
    } catch (err) {
      console.error("Get presence error:", err);
      return {};
    }
  }
}

export const presenceRepository = new PresenceRepository();

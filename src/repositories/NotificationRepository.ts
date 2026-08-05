import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { DbNotification } from "../types/auth";
import { NotificationPreference } from "../types/social";

export class NotificationRepository {
  /**
   * Fetch notifications for user
   */
  async getNotifications(userId: string, limit: number = 20): Promise<DbNotification[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as DbNotification[]) || [];
    } catch (err) {
      console.error("Get notifications error:", err);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Mark notification read error:", err);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Delete notification error:", err);
      return false;
    }
  }

  /**
   * Get or initialize notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // Preference record missing, initialize default
        const { data: newPref } = await supabase
          .from("notification_preferences")
          .insert({ user_id: userId })
          .select()
          .single();

        return newPref as NotificationPreference;
      }

      if (error) throw error;
      return data as NotificationPreference;
    } catch (err) {
      console.error("Get notification preferences error:", err);
      return null;
    }
  }

  /**
   * Save notification preferences
   */
  async savePreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          ...prefs,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Save notification preferences error:", err);
      return false;
    }
  }
}

export const notificationRepository = new NotificationRepository();

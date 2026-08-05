import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { DbProfile } from "../types/auth";
import { UserProfile } from "../types/chess";

export class ProfileRepository {
  /**
   * Fetch a user profile by ID from Supabase
   */
  async getProfileById(userId: string): Promise<DbProfile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Profile fetch error:", error.message);
        return null;
      }
      return data as DbProfile;
    } catch (err) {
      console.error("Failed to load profile:", err);
      return null;
    }
  }

  /**
   * Update profile fields
   */
  async updateProfile(userId: string, updates: Partial<DbProfile>): Promise<DbProfile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as DbProfile;
    } catch (err) {
      console.error("Profile update error:", err);
      throw err;
    }
  }

  /**
   * Helper to map DbProfile to UI UserProfile
   */
  mapToUserProfile(dbProfile: DbProfile): UserProfile {
    return {
      id: dbProfile.id,
      name: dbProfile.display_name || dbProfile.username || "Grandmaster",
      title: dbProfile.rating >= 2400 ? "GM" : dbProfile.rating >= 2200 ? "IM" : dbProfile.rating >= 2000 ? "FM" : "Contender",
      rating: {
        rapid: dbProfile.rating,
        blitz: Math.max(400, dbProfile.rating - 50),
        bullet: Math.max(400, dbProfile.rating - 100),
        puzzle: Math.max(400, dbProfile.rating + 150),
      },
      country: dbProfile.country || "India",
      avatar: dbProfile.avatar_url,
      winCount: dbProfile.wins,
      lossCount: dbProfile.losses,
      drawCount: dbProfile.draws,
      dailyStreak: 5,
    };
  }
}

export const profileRepository = new ProfileRepository();

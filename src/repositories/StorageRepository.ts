import { supabase, isSupabaseConfigured } from "../lib/supabase";

export class StorageRepository {
  /**
   * Upload an avatar file to Supabase storage bucket `avatars`
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!isSupabaseConfigured) {
      // Return blob URL for offline mode
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      // Fallback to local object URL on error
      return URL.createObjectURL(file);
    }
  }
}

export const storageRepository = new StorageRepository();

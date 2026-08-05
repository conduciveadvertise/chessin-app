import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { DbUserSettings } from "../types/auth";
import { GameSettings } from "../types/chess";

export class UserSettingsRepository {
  async getSettings(userId: string): Promise<DbUserSettings | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.warn("User settings fetch error:", error.message);
        return null;
      }
      return data as DbUserSettings;
    } catch (err) {
      console.error("Failed to load user settings:", err);
      return null;
    }
  }

  async saveSettings(userId: string, settings: Partial<GameSettings>): Promise<DbUserSettings | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const dbPayload = {
        user_id: userId,
        board_theme: settings.boardTheme,
        piece_theme: settings.pieceTheme,
        sound_enabled: settings.soundEnabled,
        highlight_legal_moves: settings.highlightLegalMoves,
        show_eval_bar: settings.showEvalBar,
        auto_flip_board: settings.autoFlipBoard,
        coach_enabled: settings.coachEnabled,
        move_animation_speed: settings.moveAnimationSpeed,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_settings")
        .upsert(dbPayload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as DbUserSettings;
    } catch (err) {
      console.error("Save settings error:", err);
      throw err;
    }
  }

  mapToGameSettings(dbSettings: DbUserSettings, defaultSettings: GameSettings): GameSettings {
    return {
      boardTheme: (dbSettings.board_theme as any) || defaultSettings.boardTheme,
      pieceTheme: (dbSettings.piece_theme as any) || defaultSettings.pieceTheme,
      soundEnabled: dbSettings.sound_enabled ?? defaultSettings.soundEnabled,
      highlightLegalMoves: dbSettings.highlight_legal_moves ?? defaultSettings.highlightLegalMoves,
      showEvalBar: dbSettings.show_eval_bar ?? defaultSettings.showEvalBar,
      autoFlipBoard: dbSettings.auto_flip_board ?? defaultSettings.autoFlipBoard,
      coachEnabled: dbSettings.coach_enabled ?? defaultSettings.coachEnabled,
      moveAnimationSpeed: (dbSettings.move_animation_speed as any) || defaultSettings.moveAnimationSpeed,
    };
  }
}

export const userSettingsRepository = new UserSettingsRepository();

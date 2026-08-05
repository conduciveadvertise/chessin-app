import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { DbGameRecord, SavedGameRecord } from "../types/chess";

export class GameRepository {
  /**
   * Create a new game in Supabase
   */
  async createGame(params: {
    whitePlayerId?: string;
    blackPlayerId?: string;
    timeControl?: string;
    gameType?: "pvp" | "ai" | "analysis" | "local";
    aiLevel?: number;
    initialFen?: string;
  }): Promise<DbGameRecord | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("games")
        .insert({
          white_player_id: params.whitePlayerId || null,
          black_player_id: params.blackPlayerId || null,
          fen: params.initialFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          time_control: params.timeControl || "10+0",
          game_type: params.gameType || "pvp",
          ai_level: params.aiLevel || 1,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;
      return data as DbGameRecord;
    } catch (err) {
      console.error("Create game error:", err);
      return null;
    }
  }

  /**
   * Save a move into the database
   */
  async recordMove(params: {
    gameId: string;
    moveNumber: number;
    ply: number;
    moveSan: string;
    moveUci: string;
    fenAfter: string;
    timeSpentMs?: number;
  }): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error: moveErr } = await supabase.from("moves").insert({
        game_id: params.gameId,
        move_number: params.moveNumber,
        ply: params.ply,
        move_san: params.moveSan,
        move_uci: params.moveUci,
        fen_after: params.fenAfter,
        time_spent_ms: params.timeSpentMs || 0,
      });

      if (moveErr) throw moveErr;

      // Update game current FEN
      await supabase
        .from("games")
        .update({
          fen: params.fenAfter,
          turn: params.fenAfter.split(" ")[1] as "w" | "b",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.gameId);

      return true;
    } catch (err) {
      console.error("Record move error:", err);
      return false;
    }
  }

  /**
   * Finalize game status
   */
  async finishGame(
    gameId: string,
    winnerId: string | null,
    winReason: "checkmate" | "timeout" | "resignation" | "stalemate" | "agreement" | "insufficient_material" | "threefold" | "fifty_move"
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const status = winReason === "stalemate" || winReason === "agreement" || winReason === "insufficient_material" || winReason === "threefold" || winReason === "fifty_move"
        ? "draw"
        : "completed";

      const { error } = await supabase
        .from("games")
        .update({
          status,
          winner_id: winnerId,
          win_reason: winReason,
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Finish game error:", err);
      return false;
    }
  }

  /**
   * Save game state locally/remotely for later resume
   */
  async saveGameForUser(userId: string, title: string, fen: string, pgn: string, timeControl: string, mode: string): Promise<SavedGameRecord | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("saved_games")
        .insert({
          user_id: userId,
          title,
          fen,
          pgn,
          time_control: timeControl,
          mode,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SavedGameRecord;
    } catch (err) {
      console.error("Save game error:", err);
      return null;
    }
  }

  /**
   * List saved games for user
   */
  async getSavedGames(userId: string): Promise<SavedGameRecord[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from("saved_games")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as SavedGameRecord[]) || [];
    } catch (err) {
      console.error("Get saved games error:", err);
      return [];
    }
  }

  /**
   * Delete saved game
   */
  async deleteSavedGame(savedGameId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from("saved_games").delete().eq("id", savedGameId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Delete saved game error:", err);
      return false;
    }
  }
}

export const gameRepository = new GameRepository();

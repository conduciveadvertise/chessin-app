import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface MatchRecord {
  id: string;
  code: string;
  room_type: "public" | "private" | "quick" | "custom";
  category: "bullet" | "blitz" | "rapid" | "classical";
  initial_time_sec: number;
  increment_sec: number;
  white_player_id?: string;
  black_player_id?: string;
  white_player_name?: string;
  black_player_name?: string;
  white_rating?: number;
  black_rating?: number;
  fen: string;
  pgn: string;
  status: "waiting" | "playing" | "completed" | "draw" | "aborted" | "abandoned";
  turn: "w" | "b";
  winner_id?: string;
  win_reason?: string;
  white_time_ms: number;
  black_time_ms: number;
  created_at: string;
  updated_at: string;
}

export class MultiplayerRepository {
  /**
   * Create new online match
   */
  async createMatch(params: {
    roomType: "public" | "private" | "quick" | "custom";
    category: "bullet" | "blitz" | "rapid" | "classical";
    initialTimeSec: number;
    incrementSec: number;
    userId?: string;
    userName: string;
    userRating: number;
  }): Promise<MatchRecord | null> {
    if (!isSupabaseConfigured) return null;

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const { data, error } = await supabase
        .from("matches")
        .insert({
          code,
          room_type: params.roomType,
          category: params.category,
          initial_time_sec: params.initialTimeSec,
          increment_sec: params.incrementSec,
          white_player_id: params.userId || null,
          white_player_name: params.userName,
          white_rating: params.userRating,
          white_time_ms: params.initialTimeSec * 1000,
          black_time_ms: params.initialTimeSec * 1000,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;
      return data as MatchRecord;
    } catch (err) {
      console.error("Create match error:", err);
      return null;
    }
  }

  /**
   * Find open public match or queue
   */
  async findMatchmakingQueue(category: string, userRating: number): Promise<MatchRecord | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "waiting")
        .eq("category", category)
        .eq("room_type", "quick")
        .is("black_player_id", null)
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        return data[0] as MatchRecord;
      }
      return null;
    } catch (err) {
      console.error("Matchmaking queue search error:", err);
      return null;
    }
  }

  /**
   * Join existing match via ID or Code
   */
  async joinMatch(
    matchIdOrCode: string,
    userId: string | undefined,
    userName: string,
    userRating: number
  ): Promise<{ match: MatchRecord | null; role: "white" | "black" | "spectator" }> {
    if (!isSupabaseConfigured) return { match: null, role: "spectator" };

    try {
      // Look up match
      const { data: match, error } = await supabase
        .from("matches")
        .select("*")
        .or(`id.eq.${matchIdOrCode},code.eq.${matchIdOrCode}`)
        .single();

      if (error || !match) return { match: null, role: "spectator" };

      // If user is white player already
      if (match.white_player_id === userId || match.white_player_name === userName) {
        return { match: match as MatchRecord, role: "white" };
      }

      // If user is black player already
      if (match.black_player_id === userId || match.black_player_name === userName) {
        return { match: match as MatchRecord, role: "black" };
      }

      // If black slot is free, claim black
      if (!match.black_player_name || match.black_player_name === "Waiting...") {
        const { data: updated, error: updateErr } = await supabase
          .from("matches")
          .update({
            black_player_id: userId || null,
            black_player_name: userName,
            black_rating: userRating,
            status: "playing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", match.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        return { match: updated as MatchRecord, role: "black" };
      }

      // Otherwise spectator
      return { match: match as MatchRecord, role: "spectator" };
    } catch (err) {
      console.error("Join match error:", err);
      return { match: null, role: "spectator" };
    }
  }

  /**
   * Send live move
   */
  async pushMove(
    matchId: string,
    fen: string,
    san: string,
    pgn: string,
    whiteTimeMs: number,
    blackTimeMs: number,
    isCheckmate: boolean,
    isDraw: boolean
  ): Promise<MatchRecord | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const nextTurn = fen.split(" ")[1] as "w" | "b";
      let status: "playing" | "completed" | "draw" = "playing";
      let winReason: string | undefined = undefined;

      if (isCheckmate) {
        status = "completed";
        winReason = "checkmate";
      } else if (isDraw) {
        status = "draw";
        winReason = "stalemate";
      }

      const { data, error } = await supabase
        .from("matches")
        .update({
          fen,
          pgn,
          turn: nextTurn,
          white_time_ms: whiteTimeMs,
          black_time_ms: blackTimeMs,
          status,
          win_reason: winReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;
      return data as MatchRecord;
    } catch (err) {
      console.error("Push move error:", err);
      return null;
    }
  }

  /**
   * Fetch live state
   */
  async getMatch(matchId: string): Promise<MatchRecord | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single();
      if (error) throw error;
      return data as MatchRecord;
    } catch (err) {
      return null;
    }
  }

  /**
   * Submit anti-cheat flag or report
   */
  async submitReport(reporterId: string, reportedId: string, matchId: string, reason: string, details?: string) {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        match_id: matchId,
        reason,
        details,
      });

      return !error;
    } catch (err) {
      return false;
    }
  }
}

export const multiplayerRepository = new MultiplayerRepository();

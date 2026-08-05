import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface RatingCalculationResult {
  newRatingWhite: number;
  newRatingBlack: number;
  changeWhite: number;
  changeBlack: number;
}

export class RatingEngine {
  /**
   * Calculates standard Elo rating updates
   * @param ratingW White's rating
   * @param ratingB Black's rating
   * @param result 1 for White win, 0 for Black win, 0.5 for Draw
   * @param kFactor Default K-factor 32
   */
  static calculateElo(
    ratingW: number,
    ratingB: number,
    result: 1 | 0 | 0.5,
    kFactor: number = 32
  ): RatingCalculationResult {
    const expectedW = 1 / (1 + Math.pow(10, (ratingB - ratingW) / 400));
    const expectedB = 1 - expectedW;

    const actualW = result;
    const actualB = 1 - result;

    const changeW = Math.round(kFactor * (actualW - expectedW));
    const changeB = Math.round(kFactor * (actualB - expectedB));

    return {
      newRatingWhite: Math.max(100, ratingW + changeW),
      newRatingBlack: Math.max(100, ratingB + changeB),
      changeWhite: changeW,
      changeBlack: changeB,
    };
  }

  /**
   * Updates player rating in database and rating history
   */
  static async processMatchRating(
    matchId: string,
    whiteUserId: string | undefined,
    blackUserId: string | undefined,
    category: "bullet" | "blitz" | "rapid" | "classical",
    whiteRating: number,
    blackRating: number,
    result: 1 | 0 | 0.5
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { newRatingWhite, newRatingBlack, changeWhite, changeBlack } = this.calculateElo(
      whiteRating,
      blackRating,
      result
    );

    try {
      // Record white player rating history
      if (whiteUserId) {
        await supabase.from("rating_history").insert({
          user_id: whiteUserId,
          category,
          old_rating: whiteRating,
          new_rating: newRatingWhite,
          change: changeWhite,
          match_id: matchId,
        });

        // Update profile rating field
        const columnMap = {
          bullet: "rating_bullet",
          blitz: "rating_blitz",
          rapid: "rating_rapid",
          classical: "rating_classical",
        };
        const col = columnMap[category];
        await supabase.from("profiles").update({ [col]: newRatingWhite }).eq("id", whiteUserId);
      }

      // Record black player rating history
      if (blackUserId) {
        await supabase.from("rating_history").insert({
          user_id: blackUserId,
          category,
          old_rating: blackRating,
          new_rating: newRatingBlack,
          change: changeBlack,
          match_id: matchId,
        });

        const columnMap = {
          bullet: "rating_bullet",
          blitz: "rating_blitz",
          rapid: "rating_rapid",
          classical: "rating_classical",
        };
        const col = columnMap[category];
        await supabase.from("profiles").update({ [col]: newRatingBlack }).eq("id", blackUserId);
      }

      // Mark match as rating processed
      await supabase.from("matches").update({ rating_processed: true }).eq("id", matchId);

      return true;
    } catch (err) {
      console.error("Process match rating error:", err);
      return false;
    }
  }
}

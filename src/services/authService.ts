import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authRepository } from "../repositories/AuthRepository";
import { profileRepository } from "../repositories/ProfileRepository";
import { userSettingsRepository } from "../repositories/UserSettingsRepository";
import { storageRepository } from "../repositories/StorageRepository";
import { UserProfile, GameSettings } from "../types/chess";
import { DbProfile } from "../types/auth";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile;
  dbProfile: DbProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial Default User Profile (used for fallback or offline guest)
const DEFAULT_USER_PROFILE: UserProfile = {
  id: "local_guest",
  name: "Grandmaster Candidate",
  title: "GM",
  rating: {
    rapid: 1850,
    blitz: 1790,
    bullet: 1720,
    puzzle: 2150,
  },
  country: "India",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  winCount: 142,
  lossCount: 38,
  drawCount: 15,
  dailyStreak: 7,
};

let currentAuthState: AuthState = {
  user: null,
  session: null,
  profile: DEFAULT_USER_PROFILE,
  dbProfile: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: true,
  error: null,
};

const listeners = new Set<(state: AuthState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentAuthState));
}

export function updateAuthState(partial: Partial<AuthState>) {
  currentAuthState = { ...currentAuthState, ...partial };
  notifyListeners();
}

/**
 * Initialize session silently on app start
 */
export async function initializeAuth(onSettingsLoaded?: (settings: Partial<GameSettings>) => void) {
  updateAuthState({ isLoading: true, error: null });

  if (!isSupabaseConfigured) {
    updateAuthState({ isLoading: false, isGuest: true });
    return;
  }

  try {
    const session = await authRepository.getSession();
    if (session && session.user) {
      const user = session.user;
      let dbProfile = await profileRepository.getProfileById(user.id);
      
      let profile: UserProfile;
      if (dbProfile) {
        profile = profileRepository.mapToUserProfile(dbProfile);
      } else {
        // Fallback mapping if trigger hasn't finished
        profile = {
          id: user.id,
          name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Chess Master",
          title: "Contender",
          rating: { rapid: 1200, blitz: 1150, bullet: 1100, puzzle: 1350 },
          country: user.user_metadata?.country || "India",
          avatar: user.user_metadata?.avatar_url || DEFAULT_USER_PROFILE.avatar,
          winCount: 0,
          lossCount: 0,
          drawCount: 0,
          dailyStreak: 1,
        };
      }

      // Load remote settings if present
      const dbSettings = await userSettingsRepository.getSettings(user.id);
      if (dbSettings && onSettingsLoaded) {
        onSettingsLoaded({
          boardTheme: dbSettings.board_theme as any,
          pieceTheme: dbSettings.piece_theme as any,
          soundEnabled: dbSettings.sound_enabled,
          highlightLegalMoves: dbSettings.highlight_legal_moves,
          showEvalBar: dbSettings.show_eval_bar,
          autoFlipBoard: dbSettings.auto_flip_board,
          coachEnabled: dbSettings.coach_enabled,
          moveAnimationSpeed: dbSettings.move_animation_speed as any,
        });
      }

      updateAuthState({
        user,
        session,
        profile,
        dbProfile,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
      });
    } else {
      updateAuthState({
        user: null,
        session: null,
        profile: DEFAULT_USER_PROFILE,
        isAuthenticated: false,
        isGuest: true,
        isLoading: false,
      });
    }

    // Subscribe to auth state changes from Supabase
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const dbProfile = await profileRepository.getProfileById(session.user.id);
        const profile = dbProfile
          ? profileRepository.mapToUserProfile(dbProfile)
          : {
              id: session.user.id,
              name: session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Master",
              title: "Contender",
              rating: { rapid: 1200, blitz: 1150, bullet: 1100, puzzle: 1350 },
              country: "India",
              avatar: session.user.user_metadata?.avatar_url || DEFAULT_USER_PROFILE.avatar,
              winCount: 0,
              lossCount: 0,
              drawCount: 0,
              dailyStreak: 1,
            };

        updateAuthState({
          user: session.user,
          session,
          profile,
          dbProfile,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
      } else if (event === "SIGNED_OUT") {
        updateAuthState({
          user: null,
          session: null,
          profile: DEFAULT_USER_PROFILE,
          dbProfile: null,
          isAuthenticated: false,
          isGuest: true,
          isLoading: false,
        });
      }
    });
  } catch (err: any) {
    console.warn("Auth initialization warning:", err);
    updateAuthState({
      isLoading: false,
      isGuest: true,
      error: err.message,
    });
  }
}

/**
 * Custom React hook to consume Auth State
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(currentAuthState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}

/**
 * Service actions for auth operations
 */
export const authService = {
  async signInWithEmail(email: string, pass: string) {
    updateAuthState({ isLoading: true, error: null });
    try {
      const data = await authRepository.signInWithEmail(email, pass);
      if (data.user) {
        const dbProfile = await profileRepository.getProfileById(data.user.id);
        const profile = dbProfile
          ? profileRepository.mapToUserProfile(dbProfile)
          : {
              ...DEFAULT_USER_PROFILE,
              id: data.user.id,
              name: data.user.email?.split("@")[0] || "Player",
            };
        updateAuthState({
          user: data.user,
          session: data.session,
          profile,
          dbProfile,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
      }
      return data;
    } catch (err: any) {
      updateAuthState({ isLoading: false, error: err.message || "Sign in failed" });
      throw err;
    }
  },

  async signUpWithEmail(email: string, pass: string, displayName: string) {
    updateAuthState({ isLoading: true, error: null });
    try {
      const data = await authRepository.signUpWithEmail(email, pass, displayName);
      updateAuthState({ isLoading: false });
      return data;
    } catch (err: any) {
      updateAuthState({ isLoading: false, error: err.message || "Sign up failed" });
      throw err;
    }
  },

  async signInWithGoogle() {
    updateAuthState({ isLoading: true, error: null });
    try {
      return await authRepository.signInWithGoogle();
    } catch (err: any) {
      updateAuthState({ isLoading: false, error: err.message || "Google sign in failed" });
      throw err;
    }
  },

  async signInAsGuest() {
    updateAuthState({ isLoading: true, error: null });
    try {
      const data = await authRepository.signInAsGuest();
      updateAuthState({
        user: data.user,
        session: data.session,
        profile: {
          ...DEFAULT_USER_PROFILE,
          id: data.user.id,
          name: "Guest Contender",
          title: "Guest",
        },
        isAuthenticated: false,
        isGuest: true,
        isLoading: false,
      });
      return data;
    } catch (err: any) {
      updateAuthState({ isLoading: false, error: err.message || "Guest sign in failed" });
      throw err;
    }
  },

  async resetPassword(email: string) {
    updateAuthState({ isLoading: true, error: null });
    try {
      const res = await authRepository.sendPasswordResetEmail(email);
      updateAuthState({ isLoading: false });
      return res;
    } catch (err: any) {
      updateAuthState({ isLoading: false, error: err.message || "Password reset failed" });
      throw err;
    }
  },

  async signOut() {
    updateAuthState({ isLoading: true, error: null });
    try {
      await authRepository.signOut();
      updateAuthState({
        user: null,
        session: null,
        profile: DEFAULT_USER_PROFILE,
        dbProfile: null,
        isAuthenticated: false,
        isGuest: true,
        isLoading: false,
      });
    } catch (err: any) {
      updateAuthState({ isLoading: false, error: err.message });
    }
  },

  async updateAvatar(file: File) {
    if (!currentAuthState.user) return;
    try {
      const publicUrl = await storageRepository.uploadAvatar(currentAuthState.user.id, file);
      const updatedProfile = { ...currentAuthState.profile, avatar: publicUrl };
      updateAuthState({ profile: updatedProfile });

      if (isSupabaseConfigured && currentAuthState.user) {
        await profileRepository.updateProfile(currentAuthState.user.id, {
          avatar_url: publicUrl,
        });
      }
    } catch (err: any) {
      console.error("Failed to update avatar:", err);
    }
  },
};

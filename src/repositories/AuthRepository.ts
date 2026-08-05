import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export class AuthRepository {
  /**
   * Get currently active session safely
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.warn("Get session error:", err);
      return null;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data.user;
    } catch (err) {
      return null;
    }
  }

  /**
   * Email / Password Login
   */
  async signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet. Please configure Supabase environment variables.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Email / Password Signup
   */
  async signUpWithEmail(email: string, password: string, displayName: string, username?: string) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet. Please set your Supabase environment variables.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: username || displayName.toLowerCase().replace(/\s+/g, "_"),
          country: "India",
        },
      },
    });
    if (error) throw error;
    return data;
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet.");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  /**
   * Sign in as Guest (Anonymous Auth or Local guest session)
   */
  async signInAsGuest() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.user) return data;
      } catch (err) {
        console.warn("Supabase anonymous auth fallback to local guest");
      }
    }
    // Guest fallback
    return {
      user: {
        id: "guest_" + Math.random().toString(36).substring(2, 10),
        email: "guest@chess.in",
        user_metadata: {
          display_name: "Guest Contender",
          country: "India",
        },
      } as any,
      session: null,
    };
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(email: string) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Refresh existing session silently
   */
  async refreshSession() {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  }

  /**
   * Sign out user
   */
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const authRepository = new AuthRepository();

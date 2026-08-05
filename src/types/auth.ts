export interface DbProfile {
  id: string;
  username: string | null;
  display_name: string;
  email: string;
  avatar_url: string;
  country: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  accuracy: number;
  online_status: "online" | "offline" | "away" | "in_game";
  last_seen: string;
  profile_visibility: "public" | "friends" | "private";
  created_at: string;
  updated_at: string;
}

export interface DbUserSettings {
  user_id: string;
  board_theme: string;
  piece_theme: string;
  sound_enabled: boolean;
  highlight_legal_moves: boolean;
  show_eval_bar: boolean;
  auto_flip_board: boolean;
  coach_enabled: boolean;
  move_animation_speed: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface AuthErrorState {
  code?: string;
  message: string;
}

export type AuthMode = "signin" | "signup" | "forgot_password" | "reset_password" | "guest";

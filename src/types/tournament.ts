export type TournamentType = "arena" | "swiss" | "private" | "public";
export type TournamentCategory = "bullet" | "blitz" | "rapid" | "classical";
export type TournamentStatus = "upcoming" | "live" | "completed" | "cancelled";

export interface Tournament {
  id: string;
  title: string;
  type: TournamentType;
  category: TournamentCategory;
  initialTimeSec: number;
  incrementSec: number;
  status: TournamentStatus;
  startsAt: string;
  durationMins: number;
  code?: string;
  isPrivate: boolean;
  maxPlayers: number;
  playerCount: number;
  prizePool: number;
  roundsCount?: number;
  currentRound?: number;
  createdBy?: string;
  createdAt: string;
}

export interface TournamentPlayer {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  userRating: number;
  userAvatar?: string;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  rank: number;
  performanceRating: number;
  tieBreak?: number;
  registeredAt: string;
}

export interface Pairing {
  id: string;
  tournamentId: string;
  roundNum: number;
  whitePlayerId: string;
  whiteName: string;
  blackPlayerId: string;
  blackName: string;
  matchId?: string;
  result?: "white" | "black" | "draw" | "ongoing";
  createdAt: string;
}

export interface Standing {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  userRating: number;
  rank: number;
  score: number;
  tieBreak: number;
}

export interface SeasonReward {
  id: string;
  seasonName: string;
  userId: string;
  userName: string;
  category: "bullet" | "blitz" | "rapid" | "classical" | "puzzle";
  rank: number;
  rewardTitle: string;
  rewardBadge: string;
  xpBonus: number;
  claimed: boolean;
}

export interface ChessEvent {
  id: string;
  title: string;
  description: string;
  category: "daily" | "weekend" | "special" | "festival" | "challenge" | "limited";
  status: "upcoming" | "active" | "ended";
  startsAt: string;
  endsAt: string;
  rewardXp: number;
  bannerImage?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "tournament" | "match" | "friend" | "puzzle" | "reward" | "achievement" | "season" | "announcement";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PlayerReport {
  id: string;
  reporterId: string;
  reporterName?: string;
  reportedId: string;
  reportedName: string;
  matchId?: string;
  tournamentId?: string;
  reason: "engine_abuse" | "stalling" | "offensive_chat" | "sandbagging" | "other";
  details?: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  createdAt: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
}

export interface OfflineMatchRecord {
  id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  fen: string;
  pgn: string;
  playedAt: string;
  synced: boolean;
}

import { supabase } from "../lib/supabase";
import {
  Tournament,
  TournamentPlayer,
  Pairing,
  Standing,
  SeasonReward,
  ChessEvent,
  SystemAnnouncement,
  PlayerReport,
} from "../types/tournament";

// Fallback / Initial Seed Tournaments
const SEED_TOURNAMENTS: Tournament[] = [
  {
    id: "tourn_01",
    title: "Mumbai Masters Arena 3+0",
    type: "arena",
    category: "blitz",
    initialTimeSec: 180,
    incrementSec: 0,
    status: "live",
    startsAt: new Date(Date.now() - 15 * 60000).toISOString(),
    durationMins: 60,
    isPrivate: false,
    maxPlayers: 256,
    playerCount: 142,
    prizePool: 15000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tourn_02",
    title: "India Swiss Rapid Championship",
    type: "swiss",
    category: "rapid",
    initialTimeSec: 600,
    incrementSec: 5,
    status: "upcoming",
    startsAt: new Date(Date.now() + 45 * 60000).toISOString(),
    durationMins: 120,
    isPrivate: false,
    maxPlayers: 128,
    playerCount: 88,
    prizePool: 25000,
    roundsCount: 5,
    currentRound: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tourn_03",
    title: "Night Owl Bullet Knockout 1+0",
    type: "arena",
    category: "bullet",
    initialTimeSec: 60,
    incrementSec: 0,
    status: "upcoming",
    startsAt: new Date(Date.now() + 180 * 60000).toISOString(),
    durationMins: 45,
    isPrivate: false,
    maxPlayers: 500,
    playerCount: 210,
    prizePool: 8000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tourn_04",
    title: "Private Grandmaster Blitz League",
    type: "private",
    category: "blitz",
    initialTimeSec: 300,
    incrementSec: 2,
    status: "upcoming",
    startsAt: new Date(Date.now() + 300 * 60000).toISOString(),
    durationMins: 90,
    code: "GML2026",
    isPrivate: true,
    maxPlayers: 32,
    playerCount: 18,
    prizePool: 50000,
    createdAt: new Date().toISOString(),
  },
];

const SEED_PLAYERS: TournamentPlayer[] = [
  {
    id: "tp_1",
    tournamentId: "tourn_01",
    userId: "usr_gukesh",
    userName: "GM Gukesh D.",
    userRating: 2794,
    score: 28,
    wins: 10,
    losses: 1,
    draws: 2,
    streak: 5,
    rank: 1,
    performanceRating: 2880,
    registeredAt: new Date().toISOString(),
  },
  {
    id: "tp_2",
    tournamentId: "tourn_01",
    userId: "usr_pragg",
    userName: "GM Praggnanandhaa R.",
    userRating: 2778,
    score: 24,
    wins: 8,
    losses: 2,
    draws: 3,
    streak: 3,
    rank: 2,
    performanceRating: 2810,
    registeredAt: new Date().toISOString(),
  },
  {
    id: "tp_3",
    tournamentId: "tourn_01",
    userId: "usr_vidit",
    userName: "GM Vidit Gujrathi",
    userRating: 2740,
    score: 20,
    wins: 7,
    losses: 3,
    draws: 1,
    streak: 1,
    rank: 3,
    performanceRating: 2760,
    registeredAt: new Date().toISOString(),
  },
  {
    id: "tp_4",
    tournamentId: "tourn_01",
    userId: "usr_you",
    userName: "You (Player)",
    userRating: 1540,
    score: 12,
    wins: 4,
    losses: 2,
    draws: 1,
    streak: 2,
    rank: 14,
    performanceRating: 1680,
    registeredAt: new Date().toISOString(),
  },
];

const SEED_EVENTS: ChessEvent[] = [
  {
    id: "evt_01",
    title: "Daily Blitz Warmup",
    description: "Play 3 blitz matches today to claim +250 XP bonus!",
    category: "daily",
    status: "active",
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    rewardXp: 250,
  },
  {
    id: "evt_02",
    title: "Weekend Grand Slam",
    description: "Participate in Saturday's Swiss Rapid Championship and finish top 20.",
    category: "weekend",
    status: "active",
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 48 * 3600000).toISOString(),
    rewardXp: 1000,
  },
  {
    id: "evt_03",
    title: "Diwali Chess Festival Tournament",
    description: "Celebrate with special golden board skin rewards and 50,000 INR prize pool!",
    category: "festival",
    status: "upcoming",
    startsAt: new Date(Date.now() + 72 * 3600000).toISOString(),
    endsAt: new Date(Date.now() + 120 * 3600000).toISOString(),
    rewardXp: 2500,
  },
];

const SEED_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: "ann_01",
    title: "Season 14 Grand Finale Launch!",
    content: "Season 14 has officially reset. All players receive rating badges and tier rewards in their inbox.",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ann_02",
    title: "Anti-Engine Fair Play Update v4.2",
    content: "Our AI detection model has been updated to analyze sub-second move variance and eval accuracy automatically.",
    priority: "normal",
    createdAt: new Date().toISOString(),
  },
];

const SEED_REPORTS: PlayerReport[] = [
  {
    id: "rep_01",
    reporterId: "usr_vidit",
    reporterName: "GM Vidit Gujrathi",
    reportedId: "usr_suspect01",
    reportedName: "ChessMaster999",
    reason: "engine_abuse",
    details: "100% top engine choice accuracy over 40 moves with 0.1s uniform timestamp variance.",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rep_02",
    reporterId: "usr_pragg",
    reporterName: "GM Praggnanandhaa R.",
    reportedId: "usr_staller02",
    reportedName: "TimerRager",
    reason: "stalling",
    details: "Purposely let clock run down 10 minutes in lost mate-in-1 position.",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export class TournamentRepository {
  private localTournaments: Tournament[] = [...SEED_TOURNAMENTS];
  private localPlayers: TournamentPlayer[] = [...SEED_PLAYERS];
  private localEvents: ChessEvent[] = [...SEED_EVENTS];
  private localAnnouncements: SystemAnnouncement[] = [...SEED_ANNOUNCEMENTS];
  private localReports: PlayerReport[] = [...SEED_REPORTS];

  async getTournaments(): Promise<Tournament[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase.from("tournaments").select("*").order("starts_at", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((t: any) => ({
            id: t.id,
            title: t.title,
            type: t.type,
            category: t.category,
            initialTimeSec: t.initial_time_sec,
            incrementSec: t.increment_sec,
            status: t.status,
            startsAt: t.starts_at,
            durationMins: t.duration_mins,
            code: t.code,
            isPrivate: t.is_private,
            maxPlayers: t.max_players,
            playerCount: t.player_count || 32,
            prizePool: t.prize_pool,
            createdAt: t.created_at,
          }));
        }
      }
    } catch (e) {
      console.warn("Supabase tournament query failed, using local seed", e);
    }
    return this.localTournaments;
  }

  async createTournament(tourn: Partial<Tournament>): Promise<Tournament> {
    const newTourn: Tournament = {
      id: "tourn_" + Date.now(),
      title: tourn.title || "Custom Arena Blitz",
      type: tourn.type || "arena",
      category: tourn.category || "blitz",
      initialTimeSec: tourn.initialTimeSec || 300,
      incrementSec: tourn.incrementSec || 0,
      status: "upcoming",
      startsAt: tourn.startsAt || new Date(Date.now() + 15 * 60000).toISOString(),
      durationMins: tourn.durationMins || 60,
      code: tourn.isPrivate ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined,
      isPrivate: !!tourn.isPrivate,
      maxPlayers: tourn.maxPlayers || 128,
      playerCount: 1,
      prizePool: tourn.prizePool || 10000,
      createdAt: new Date().toISOString(),
    };

    this.localTournaments.unshift(newTourn);

    try {
      if (supabase) {
        await supabase.from("tournaments").insert([
          {
            id: newTourn.id,
            title: newTourn.title,
            type: newTourn.type,
            category: newTourn.category,
            initial_time_sec: newTourn.initialTimeSec,
            increment_sec: newTourn.incrementSec,
            status: newTourn.status,
            starts_at: newTourn.startsAt,
            duration_mins: newTourn.durationMins,
            code: newTourn.code,
            is_private: newTourn.isPrivate,
            max_players: newTourn.maxPlayers,
            prize_pool: newTourn.prizePool,
          },
        ]);
      }
    } catch (e) {
      console.warn("Supabase insert failed", e);
    }

    return newTourn;
  }

  async registerPlayer(tournamentId: string, user: { id: string; name: string; rating: number }): Promise<boolean> {
    const existing = this.localPlayers.find((p) => p.tournamentId === tournamentId && p.userId === user.id);
    if (!existing) {
      const newPlayer: TournamentPlayer = {
        id: "tp_" + Date.now(),
        tournamentId,
        userId: user.id,
        userName: user.name,
        userRating: user.rating,
        score: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 0,
        rank: this.localPlayers.filter((p) => p.tournamentId === tournamentId).length + 1,
        performanceRating: user.rating,
        registeredAt: new Date().toISOString(),
      };
      this.localPlayers.push(newPlayer);

      const tourn = this.localTournaments.find((t) => t.id === tournamentId);
      if (tourn) tourn.playerCount += 1;
    }
    return true;
  }

  async withdrawPlayer(tournamentId: string, userId: string): Promise<boolean> {
    this.localPlayers = this.localPlayers.filter((p) => !(p.tournamentId === tournamentId && p.userId === userId));
    const tourn = this.localTournaments.find((t) => t.id === tournamentId);
    if (tourn && tourn.playerCount > 0) tourn.playerCount -= 1;
    return true;
  }

  async getTournamentPlayers(tournamentId: string): Promise<TournamentPlayer[]> {
    return this.localPlayers
      .filter((p) => p.tournamentId === tournamentId)
      .sort((a, b) => b.score - a.score);
  }

  async getPairings(tournamentId: string): Promise<Pairing[]> {
    const players = await this.getTournamentPlayers(tournamentId);
    if (players.length < 2) return [];

    const pairings: Pairing[] = [];
    for (let i = 0; i < players.length - 1; i += 2) {
      pairings.push({
        id: `pair_${i}`,
        tournamentId,
        roundNum: 1,
        whitePlayerId: players[i].userId,
        whiteName: players[i].userName,
        blackPlayerId: players[i + 1].userId,
        blackName: players[i + 1].userName,
        result: i === 0 ? "white" : "ongoing",
        createdAt: new Date().toISOString(),
      });
    }
    return pairings;
  }

  async getEvents(): Promise<ChessEvent[]> {
    return this.localEvents;
  }

  async getAnnouncements(): Promise<SystemAnnouncement[]> {
    return this.localAnnouncements;
  }

  async postAnnouncement(ann: Partial<SystemAnnouncement>): Promise<SystemAnnouncement> {
    const item: SystemAnnouncement = {
      id: "ann_" + Date.now(),
      title: ann.title || "Notice",
      content: ann.content || "",
      priority: ann.priority || "normal",
      createdAt: new Date().toISOString(),
    };
    this.localAnnouncements.unshift(item);
    return item;
  }

  async getPlayerReports(): Promise<PlayerReport[]> {
    return this.localReports;
  }

  async updateReportStatus(reportId: string, status: PlayerReport["status"]): Promise<boolean> {
    const rep = this.localReports.find((r) => r.id === reportId);
    if (rep) rep.status = status;
    return true;
  }
}

export const tournamentRepository = new TournamentRepository();

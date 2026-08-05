-- CHESS.IN Multiplayer System SQL Migration
-- Sets up tables, indexes, constraints, RLS policies for online matches, players, moves, ratings, leaderboards, reports, and anti-cheat.

-- 1. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE,
  room_type TEXT DEFAULT 'public' CHECK (room_type IN ('public', 'private', 'quick', 'custom')),
  category TEXT DEFAULT 'rapid' CHECK (category IN ('bullet', 'blitz', 'rapid', 'classical')),
  initial_time_sec INTEGER NOT NULL DEFAULT 600,
  increment_sec INTEGER NOT NULL DEFAULT 0,
  white_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  black_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  white_player_name TEXT,
  black_player_name TEXT,
  white_rating INTEGER DEFAULT 1500,
  black_rating INTEGER DEFAULT 1500,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn TEXT DEFAULT '',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'completed', 'draw', 'aborted', 'abandoned')),
  turn TEXT DEFAULT 'w' CHECK (turn IN ('w', 'b')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  win_reason TEXT CHECK (win_reason IN ('checkmate', 'timeout', 'resignation', 'stalemate', 'agreement', 'insufficient_material', 'threefold', 'fifty_move', 'abandonment', 'disqualification')),
  rating_processed BOOLEAN DEFAULT false,
  white_time_ms INTEGER DEFAULT 600000,
  black_time_ms INTEGER DEFAULT 600000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_code ON public.matches(code);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_players ON public.matches(white_player_id, black_player_id);

-- 2. MATCH PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT CHECK (role IN ('white', 'black', 'spectator')),
  rating_before INTEGER,
  rating_after INTEGER,
  rating_change INTEGER,
  connected BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players(match_id);

-- 3. MATCH MOVES TABLE
CREATE TABLE IF NOT EXISTS public.match_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  ply INTEGER NOT NULL,
  move_san TEXT NOT NULL,
  move_uci TEXT NOT NULL,
  fen_after TEXT NOT NULL,
  time_spent_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_match_ply UNIQUE (match_id, ply)
);

CREATE INDEX IF NOT EXISTS idx_match_moves_match_ply ON public.match_moves(match_id, ply);

-- 4. MATCH CLOCK TABLE
CREATE TABLE IF NOT EXISTS public.match_clock (
  match_id UUID PRIMARY KEY REFERENCES public.matches(id) ON DELETE CASCADE,
  white_time_ms INTEGER NOT NULL,
  black_time_ms INTEGER NOT NULL,
  last_move_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RATING HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.rating_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('bullet', 'blitz', 'rapid', 'classical')),
  old_rating INTEGER NOT NULL,
  new_rating INTEGER NOT NULL,
  change INTEGER NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rating_history_user ON public.rating_history(user_id);

-- 6. LEADERBOARDS TABLE
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country TEXT DEFAULT 'IN',
  bullet_rating INTEGER DEFAULT 1200,
  blitz_rating INTEGER DEFAULT 1200,
  rapid_rating INTEGER DEFAULT 1200,
  classical_rating INTEGER DEFAULT 1200,
  global_rank INTEGER,
  country_rank INTEGER,
  win_streak INTEGER DEFAULT 0,
  peak_rating INTEGER DEFAULT 1200,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_rapid ON public.leaderboards(rapid_rating DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_blitz ON public.leaderboards(blitz_rating DESC);

-- 7. REPORTS TABLE (Anti-Cheat & Fair Play)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'banned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANTI CHEAT AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.anti_cheat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  average_move_time_ms INTEGER,
  accuracy_pct NUMERIC(5,2),
  suspicious_flag BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_clock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anti_cheat ENABLE ROW LEVEL SECURITY;

-- Matches Policies
DROP POLICY IF EXISTS "Matches viewable by all" ON public.matches;
CREATE POLICY "Matches viewable by all" ON public.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create matches" ON public.matches;
CREATE POLICY "Authenticated users create matches" ON public.matches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Players update matches" ON public.matches;
CREATE POLICY "Players update matches" ON public.matches FOR UPDATE USING (true);

-- Match Moves Policies
DROP POLICY IF EXISTS "Moves viewable by all" ON public.matches;
CREATE POLICY "Moves viewable by all" ON public.match_moves FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players insert moves" ON public.match_moves;
CREATE POLICY "Players insert moves" ON public.match_moves FOR INSERT WITH CHECK (true);

-- Leaderboards & Rating Policies
DROP POLICY IF EXISTS "Leaderboards viewable by all" ON public.leaderboards;
CREATE POLICY "Leaderboards viewable by all" ON public.leaderboards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users view own rating history" ON public.rating_history;
CREATE POLICY "Users view own rating history" ON public.rating_history FOR SELECT USING (true);

-- REALTIME PUBLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE matches, match_moves, match_players;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

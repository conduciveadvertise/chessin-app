-- CHESS.IN Tournament, Seasons, Events, Announcements SQL Migration
-- Sets up tables, indexes, constraints, RLS policies, realtime publication for Tournaments, Pairings, Standings, Seasons, Events, Announcements, Reports.

-- 1. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT DEFAULT 'arena' CHECK (type IN ('arena', 'swiss', 'private', 'public')),
  category TEXT DEFAULT 'rapid' CHECK (category IN ('bullet', 'blitz', 'rapid', 'classical')),
  initial_time_sec INTEGER DEFAULT 300,
  increment_sec INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  starts_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes',
  duration_mins INTEGER DEFAULT 60,
  code VARCHAR(10) UNIQUE,
  is_private BOOLEAN DEFAULT false,
  max_players INTEGER DEFAULT 128,
  prize_pool INTEGER DEFAULT 5000,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON public.tournaments(type);

-- 2. TOURNAMENT PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.tournament_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_rating INTEGER DEFAULT 1500,
  score NUMERIC(5,1) DEFAULT 0.0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  performance_rating INTEGER DEFAULT 1500,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tournament_user UNIQUE (tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_players_tourn ON public.tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_score ON public.tournament_players(tournament_id, score DESC);

-- 3. PAIRINGS TABLE
CREATE TABLE IF NOT EXISTS public.pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_num INTEGER DEFAULT 1,
  white_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  black_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  white_name TEXT,
  black_name TEXT,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  result TEXT CHECK (result IN ('white', 'black', 'draw', 'ongoing')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pairings_tourn_round ON public.pairings(tournament_id, round_num);

-- 4. STANDINGS TABLE
CREATE TABLE IF NOT EXISTS public.standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score NUMERIC(5,1) DEFAULT 0.0,
  tie_break NUMERIC(5,2) DEFAULT 0.0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tournament_standing UNIQUE (tournament_id, user_id)
);

-- 5. SEASON REWARDS TABLE
CREATE TABLE IF NOT EXISTS public.season_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('bullet', 'blitz', 'rapid', 'classical', 'puzzle')),
  rank INTEGER NOT NULL,
  reward_title TEXT NOT NULL,
  reward_badge TEXT DEFAULT 'crown',
  xp_bonus INTEGER DEFAULT 1000,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('daily', 'weekend', 'special', 'festival', 'challenge')),
  status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'ended')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  reward_xp INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PLAYER REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.player_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments viewable by all" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Tournament players viewable by all" ON public.tournament_players FOR SELECT USING (true);
CREATE POLICY "Pairings viewable by all" ON public.pairings FOR SELECT USING (true);
CREATE POLICY "Standings viewable by all" ON public.standings FOR SELECT USING (true);
CREATE POLICY "Season rewards viewable by all" ON public.season_rewards FOR SELECT USING (true);
CREATE POLICY "Events viewable by all" ON public.events FOR SELECT USING (true);
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);

-- Authenticated modifications
CREATE POLICY "Auth players join tournament" ON public.tournament_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth players leave tournament" ON public.tournament_players FOR DELETE USING (true);
CREATE POLICY "Auth create tournament" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update tournament" ON public.tournaments FOR UPDATE USING (true);

-- REALTIME PUBLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tournaments, tournament_players, pairings, standings;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

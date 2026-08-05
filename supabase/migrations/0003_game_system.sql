-- CHESS.IN Game System SQL Migration
-- Sets up tables, indexes, constraints, RLS policies for games, moves, saved_games, and analysis.

-- 1. GAMES TABLE
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  black_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn TEXT DEFAULT '',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'draw', 'abandoned')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  win_reason TEXT CHECK (win_reason IN ('checkmate', 'timeout', 'resignation', 'stalemate', 'agreement', 'insufficient_material', 'threefold', 'fifty_move', 'abandonment')),
  time_control TEXT DEFAULT '10+0',
  game_type TEXT DEFAULT 'pvp' CHECK (game_type IN ('pvp', 'ai', 'analysis', 'local')),
  ai_level INTEGER DEFAULT 1 CHECK (ai_level BETWEEN 1 AND 20),
  white_time_ms INTEGER DEFAULT 600000,
  black_time_ms INTEGER DEFAULT 600000,
  turn TEXT DEFAULT 'w' CHECK (turn IN ('w', 'b')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_games_white_player ON public.games(white_player_id);
CREATE INDEX IF NOT EXISTS idx_games_black_player ON public.games(black_player_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);

-- 2. MOVES TABLE
CREATE TABLE IF NOT EXISTS public.moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  ply INTEGER NOT NULL,
  move_san TEXT NOT NULL,
  move_uci TEXT NOT NULL,
  fen_after TEXT NOT NULL,
  time_spent_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_game_ply UNIQUE (game_id, ply)
);

CREATE INDEX IF NOT EXISTS idx_moves_game_ply ON public.moves(game_id, ply);

-- 3. SAVED GAMES TABLE
CREATE TABLE IF NOT EXISTS public.saved_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Saved Game',
  fen TEXT NOT NULL,
  pgn TEXT DEFAULT '',
  time_control TEXT DEFAULT '10+0',
  mode TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_games_user ON public.saved_games(user_id);

-- 4. ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS public.analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  ply INTEGER NOT NULL,
  evaluation NUMERIC(5,2),
  best_move TEXT,
  category TEXT CHECK (category IN ('brilliant', 'great', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_analysis_game_ply UNIQUE (game_id, ply)
);

CREATE INDEX IF NOT EXISTS idx_analysis_game ON public.analysis(game_id);

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis ENABLE ROW LEVEL SECURITY;

-- Games Policies
DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
CREATE POLICY "Games are viewable by everyone" ON public.games
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create games" ON public.games;
CREATE POLICY "Authenticated users can create games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = white_player_id OR auth.uid() = black_player_id OR white_player_id IS NULL);

DROP POLICY IF EXISTS "Players can update their games" ON public.games;
CREATE POLICY "Players can update their games" ON public.games
  FOR UPDATE USING (auth.uid() = white_player_id OR auth.uid() = black_player_id OR white_player_id IS NULL);

-- Moves Policies
DROP POLICY IF EXISTS "Moves are viewable by everyone" ON public.moves;
CREATE POLICY "Moves are viewable by everyone" ON public.moves
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can insert moves" ON public.moves;
CREATE POLICY "Players can insert moves" ON public.moves
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games
      WHERE id = public.moves.game_id
      AND (white_player_id = auth.uid() OR black_player_id = auth.uid() OR white_player_id IS NULL)
    )
  );

-- Saved Games Policies
DROP POLICY IF EXISTS "Users can view their saved games" ON public.saved_games;
CREATE POLICY "Users can view their saved games" ON public.saved_games
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert saved games" ON public.saved_games;
CREATE POLICY "Users can insert saved games" ON public.saved_games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete saved games" ON public.saved_games;
CREATE POLICY "Users can delete saved games" ON public.saved_games
  FOR DELETE USING (auth.uid() = user_id);

-- Analysis Policies
DROP POLICY IF EXISTS "Analysis is viewable by everyone" ON public.analysis;
CREATE POLICY "Analysis is viewable by everyone" ON public.analysis
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert analysis" ON public.analysis;
CREATE POLICY "Users can insert analysis" ON public.analysis
  FOR INSERT WITH CHECK (true);

-- REALTIME PUBLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE games, moves;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- CHESS.IN Learning System SQL Migration
-- Sets up tables, indexes, constraints, RLS policies for lessons, puzzles, attempts, daily_puzzles, missions, achievements, user_progress, xp_history, opening_database, endgame_training.

-- 1. PUZZLES TABLE
CREATE TABLE IF NOT EXISTS public.puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fen TEXT NOT NULL,
  moves TEXT[] NOT NULL, -- UCI move sequence e.g. ['e2e4', 'e7e5']
  rating INTEGER DEFAULT 1500,
  theme TEXT DEFAULT 'tactic' CHECK (theme IN ('mate_in_1', 'mate_in_2', 'mate_in_3', 'fork', 'pin', 'skewer', 'discovered_attack', 'double_attack', 'deflection', 'decoy', 'smothered_mate', 'back_rank', 'promotion', 'endgame', 'opening_trap', 'tactic')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puzzles_rating ON public.puzzles(rating);
CREATE INDEX IF NOT EXISTS idx_puzzles_theme ON public.puzzles(theme);

-- 2. DAILY PUZZLES TABLE
CREATE TABLE IF NOT EXISTS public.daily_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_id UUID REFERENCES public.puzzles(id) ON DELETE CASCADE,
  puzzle_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT DEFAULT 'Daily Chess Challenge',
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PUZZLE ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES public.puzzles(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  time_spent_ms INTEGER DEFAULT 0,
  rating_before INTEGER,
  rating_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_user ON public.puzzle_attempts(user_id);

-- 4. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'grandmaster')),
  category TEXT NOT NULL,
  description TEXT,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  solution_moves TEXT[] DEFAULT '{}',
  explanation TEXT,
  xp_reward INTEGER DEFAULT 100,
  order_num INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_level ON public.lessons(level);

-- 5. USER PROGRESS & XP HISTORY
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  puzzle_rating INTEGER DEFAULT 1500,
  daily_streak INTEGER DEFAULT 0,
  last_daily_puzzle_date DATE,
  puzzles_solved INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 100,
  mission_type TEXT CHECK (mission_type IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACHIEVEMENTS & USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT DEFAULT 'award',
  xp_reward INTEGER DEFAULT 250
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 8. OPENING DATABASE & ENDGAME TRAINING TABLES
CREATE TABLE IF NOT EXISTS public.opening_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eco VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  pgn_moves TEXT NOT NULL,
  win_rate_white NUMERIC(4,1) DEFAULT 45.0,
  win_rate_black NUMERIC(4,1) DEFAULT 40.0,
  draw_rate NUMERIC(4,1) DEFAULT 15.0,
  popular_continuations TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.endgame_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('king_queen', 'king_rook', 'king_pawn', 'lucena', 'philidor', 'basic_mates')),
  fen TEXT NOT NULL,
  goal_instructions TEXT NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endgame_training ENABLE ROW LEVEL SECURITY;

-- Read policies for learning materials
CREATE POLICY "Puzzles viewable by all" ON public.puzzles FOR SELECT USING (true);
CREATE POLICY "Daily puzzles viewable by all" ON public.daily_puzzles FOR SELECT USING (true);
CREATE POLICY "Lessons viewable by all" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Openings viewable by all" ON public.opening_database FOR SELECT USING (true);
CREATE POLICY "Endgames viewable by all" ON public.endgame_training FOR SELECT USING (true);
CREATE POLICY "Achievements viewable by all" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Missions viewable by all" ON public.missions FOR SELECT USING (true);

-- User specific write policies
CREATE POLICY "User progress viewable by owner" ON public.user_progress FOR SELECT USING (true);
CREATE POLICY "User progress editable by owner" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Puzzle attempts user view" ON public.puzzle_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Puzzle attempts user insert" ON public.puzzle_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User achievements view" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "User achievements insert" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

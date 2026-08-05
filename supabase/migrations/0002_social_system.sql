-- CHESS.IN Social System SQL Migration
-- Sets up tables, triggers, indexes, RLS policies, and Realtime publication for social features.

-- 1. FRIEND REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_sender_receiver UNIQUE (sender_id, receiver_id),
  CONSTRAINT no_self_friend_request CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id, status);

-- 2. FRIENDS TABLE
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_friend UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friends CHECK (user_id <> friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON public.friends(friend_id);

-- 3. CONVERSATIONS & PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_conversation_user UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen')),
  deleted_by_users UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

-- 5. MATCH INVITES
CREATE TABLE IF NOT EXISTS public.match_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_control TEXT DEFAULT '10+0',
  mode TEXT DEFAULT 'rated',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 minutes')
);

CREATE INDEX IF NOT EXISTS idx_match_invites_receiver ON public.match_invites(receiver_id, status);

-- 6. PRESENCE TABLE
CREATE TABLE IF NOT EXISTS public.presence (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'in_match', 'in_analysis', 'idle')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TYPING STATUS
CREATE TABLE IF NOT EXISTS public.typing_status (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- 8. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_requests BOOLEAN DEFAULT true,
  match_invites BOOLEAN DEFAULT true,
  messages BOOLEAN DEFAULT true,
  daily_puzzle BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Friend Requests Policies
DROP POLICY IF EXISTS "Users can view their incoming or outgoing friend requests" ON public.friend_requests;
CREATE POLICY "Users can view their incoming or outgoing friend requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create friend requests" ON public.friend_requests;
CREATE POLICY "Users can create friend requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update relevant friend requests" ON public.friend_requests;
CREATE POLICY "Users can update relevant friend requests" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete friend requests" ON public.friend_requests;
CREATE POLICY "Users can delete friend requests" ON public.friend_requests
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Friends Policies
DROP POLICY IF EXISTS "Users can view their friends list" ON public.friends;
CREATE POLICY "Users can view their friends list" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert friends" ON public.friends;
CREATE POLICY "Users can insert friends" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can remove friends" ON public.friends;
CREATE POLICY "Users can remove friends" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Conversations Policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.conversations.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

-- Conversation Participants Policies
DROP POLICY IF EXISTS "Users can view participants" ON public.conversation_participants;
CREATE POLICY "Users can view participants" ON public.conversation_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert participants" ON public.conversation_participants;
CREATE POLICY "Users can insert participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (true);

-- Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages into their conversations" ON public.messages;
CREATE POLICY "Users can insert messages into their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update message status" ON public.messages;
CREATE POLICY "Users can update message status" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Match Invites Policies
DROP POLICY IF EXISTS "Users can view match invites" ON public.match_invites;
CREATE POLICY "Users can view match invites" ON public.match_invites
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create match invites" ON public.match_invites;
CREATE POLICY "Users can create match invites" ON public.match_invites
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update match invites" ON public.match_invites;
CREATE POLICY "Users can update match invites" ON public.match_invites
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Presence Policies
DROP POLICY IF EXISTS "Presence is viewable by everyone" ON public.presence;
CREATE POLICY "Presence is viewable by everyone" ON public.presence
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own presence" ON public.presence;
CREATE POLICY "Users can update their own presence" ON public.presence
  FOR ALL USING (auth.uid() = user_id);

-- Typing Status Policies
DROP POLICY IF EXISTS "Typing status viewable by conversation participants" ON public.typing_status;
CREATE POLICY "Typing status viewable by conversation participants" ON public.typing_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage typing status" ON public.typing_status;
CREATE POLICY "Users can manage typing status" ON public.typing_status
  FOR ALL USING (auth.uid() = user_id);

-- Notification Preferences Policies
DROP POLICY IF EXISTS "Users can manage notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ADD TABLES TO REALTIME PUBLICATION IF NEEDED
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests, friends, messages, match_invites, presence, typing_status, notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

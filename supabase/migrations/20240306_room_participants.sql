-- Create room participants table
CREATE TABLE public.room_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_ready BOOLEAN DEFAULT FALSE NOT NULL,
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view participants of any room"
  ON public.room_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join a room"
  ON public.room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave/update their own participation"
  ON public.room_participants FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their ready status"
  ON public.room_participants FOR UPDATE
  USING (auth.uid() = user_id);

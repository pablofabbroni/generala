-- Add min_participants and table_size to tournaments
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 2;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS table_size INTEGER DEFAULT 2; -- 2 (1v1), 3, 4

-- Add the same to rooms if they exist
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 2;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS table_size INTEGER DEFAULT 2;

-- Function to clean old inactive rooms (older than 10 mins and status 'waiting')
CREATE OR REPLACE FUNCTION public.cleanup_inactive_rooms()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rooms
    WHERE status = 'waiting'
    AND created_at < (now() - interval '10 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

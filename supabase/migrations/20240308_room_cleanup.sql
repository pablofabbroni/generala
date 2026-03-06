-- Function to cleanup old inactive rooms
CREATE OR REPLACE FUNCTION public.cleanup_stale_rooms()
RETURNS void AS $$
BEGIN
  -- Delete rooms created more than 10 minutes ago that are still "active" (waiting)
  -- but haven't started (is_active = true)
  DELETE FROM public.rooms
  WHERE is_active = true
    AND created_at < NOW() - INTERVAL '10 minutes'
    -- If we had a participant count, we could also check for empty rooms
    AND NOT EXISTS (
        SELECT 1 FROM public.room_participants 
        WHERE room_id = public.rooms.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To fully automate this, pg_cron is needed.
-- For now, we'll manually call it from the frontend or use a trigger/hook if possible.
-- Example cron: SELECT cron.schedule('*/5 * * * *', 'SELECT cleanup_stale_rooms()');

-- Migration to enhance referral tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- Update handle_new_user to capture referred_by from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    image, 
    alias, 
    invite_code,
    referred_by_code
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    LOWER(REPLACE(NEW.raw_user_meta_data->>'full_name', ' ', '_')) || '_' || SUBSTR(CAST(NEW.id AS TEXT), 1, 4),
    UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    NEW.raw_user_meta_data->>'referred_by'
  );
  
  -- Initial Stats
  INSERT INTO public.player_stats (user_id) VALUES (NEW.id);
  
  -- Register Bonus: +200 chips
  UPDATE public.profiles SET credits = 200 WHERE id = NEW.id;
  
  INSERT INTO public.transactions (user_id, type, amount, meta)
  VALUES (NEW.id, 'register_bonus', 200, jsonb_build_object('reason', 'First time registration bonus', 'referred_by', NEW.raw_user_meta_data->>'referred_by'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

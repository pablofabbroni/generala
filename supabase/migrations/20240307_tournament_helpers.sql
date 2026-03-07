-- Helper function to deduct credits securely
CREATE OR REPLACE FUNCTION public.deduct_credits(user_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  IF (SELECT credits FROM public.profiles WHERE id = user_id) < amount THEN
    RAISE EXCEPTION 'Créditos insuficientes';
  END IF;

  UPDATE public.profiles
  SET credits = credits - amount
  WHERE id = user_id;

  INSERT INTO public.transactions (user_id, type, amount, meta)
  VALUES (user_id, 'game_entry', -amount, jsonb_build_object('reason', 'Tournament entry fee'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration for Dollars currency, Tournament control and Chat system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS usd_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT FALSE;

-- Chat Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    type TEXT DEFAULT 'global', -- 'global', 'private'
    receiver_id UUID REFERENCES public.profiles(id), -- Null for global
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global messages" 
ON public.messages FOR SELECT 
USING (type = 'global' OR auth.uid() = user_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user to pay referral bonus in USD
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
BEGIN
    -- Check if there's a referrer
    IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
        SELECT id INTO referrer_id FROM public.profiles WHERE invite_code = NEW.raw_user_meta_data->>'referred_by';
        
        IF referrer_id IS NOT NULL THEN
            -- Pay $5 USD to referrer
            UPDATE public.profiles SET usd_balance = usd_balance + 5.00 WHERE id = referrer_id;
            
            INSERT INTO public.transactions (user_id, type, amount, meta)
            VALUES (referrer_id, 'referral_bonus', 5.00, jsonb_build_object('reason', 'Referral bonus for ' || NEW.email, 'new_user_id', NEW.id));
        END IF;
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        name, 
        image, 
        alias, 
        invite_code,
        referred_by_code,
        credits,
        usd_balance
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'avatar_url',
        LOWER(REPLACE(NEW.raw_user_meta_data->>'full_name', ' ', '_')) || '_' || SUBSTR(CAST(NEW.id AS TEXT), 1, 4),
        UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
        NEW.raw_user_meta_data->>'referred_by',
        200, -- Default chips
        0.00
    );
    
    -- Initial Stats
    INSERT INTO public.player_stats (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration to fix profiles schema and add missing columns
DO $$ 
BEGIN 
    -- alias
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='alias') THEN
        ALTER TABLE public.profiles ADD COLUMN alias TEXT UNIQUE;
    END IF;

    -- invite_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='invite_code') THEN
        ALTER TABLE public.profiles ADD COLUMN invite_code TEXT UNIQUE;
    END IF;
END $$;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';

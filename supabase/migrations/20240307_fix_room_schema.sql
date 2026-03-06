-- Fix missing invite_code column and ensure it's unique
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='invite_code') THEN
        ALTER TABLE public.rooms ADD COLUMN invite_code TEXT UNIQUE;
    END IF;
END $$;

-- Verify RLS for room creation
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rooms' AND policyname='Users can create rooms') THEN
        CREATE POLICY "Users can create rooms"
          ON public.rooms FOR INSERT
          WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

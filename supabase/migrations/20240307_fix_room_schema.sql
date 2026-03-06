-- 1. Reparar TODAS las columnas de la tabla 'rooms' una por una
DO $$ 
BEGIN 
    -- name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='name') THEN
        ALTER TABLE public.rooms ADD COLUMN name TEXT NOT NULL DEFAULT 'Nueva Sala';
    END IF;

    -- level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='level') THEN
        ALTER TABLE public.rooms ADD COLUMN level TEXT NOT NULL DEFAULT 'casual';
    END IF;

    -- variant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='variant') THEN
        ALTER TABLE public.rooms ADD COLUMN variant TEXT NOT NULL DEFAULT 'standard';
    END IF;

    -- players_allowed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='players_allowed') THEN
        ALTER TABLE public.rooms ADD COLUMN players_allowed INT NOT NULL DEFAULT 4;
    END IF;

    -- entry_fee
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='entry_fee') THEN
        ALTER TABLE public.rooms ADD COLUMN entry_fee INT NOT NULL DEFAULT 0;
    END IF;

    -- invite_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='invite_code') THEN
        ALTER TABLE public.rooms ADD COLUMN invite_code TEXT UNIQUE;
    END IF;

    -- is_private
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='is_private') THEN
        ALTER TABLE public.rooms ADD COLUMN is_private BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;

    -- password
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='password') THEN
        ALTER TABLE public.rooms ADD COLUMN password TEXT;
    END IF;

    -- max_players
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='max_players') THEN
        ALTER TABLE public.rooms ADD COLUMN max_players INT DEFAULT 4 NOT NULL;
    END IF;

    -- rules
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='rules') THEN
        ALTER TABLE public.rooms ADD COLUMN rules JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='is_active') THEN
        ALTER TABLE public.rooms ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
    END IF;
END $$;

-- 2. Asegurar políticas RLS
DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
CREATE POLICY "Users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view active rooms." ON public.rooms;
CREATE POLICY "Anyone can view active rooms." 
  ON public.rooms FOR SELECT 
  USING (is_active = true OR is_private = true);

-- 3. Refrescar Cache
NOTIFY pgrst, 'reload schema';

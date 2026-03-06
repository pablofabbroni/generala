-- 1. Reparar columnas de la tabla 'rooms'
DO $$ 
BEGIN 
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

    -- rules (JSONB to store variants)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='rules') THEN
        ALTER TABLE public.rooms ADD COLUMN rules JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Asegurar políticas RLS para permitir creación y visualización
DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
CREATE POLICY "Users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view active rooms." ON public.rooms;
CREATE POLICY "Anyone can view active rooms." 
  ON public.rooms FOR SELECT 
  USING (is_active = true OR is_private = true);

-- 3. Forzar refresco de cache de PostgREST
NOTIFY pgrst, 'reload schema';

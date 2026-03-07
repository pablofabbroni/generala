-- Migration to add is_public to profiles and policies for public access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Policy to allow anyone to read public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (is_public = TRUE OR auth.uid() = id);

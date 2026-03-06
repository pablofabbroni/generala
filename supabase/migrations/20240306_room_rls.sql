-- Allow authenticated users to create rooms
CREATE POLICY "Users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow room creators to update their own rooms
CREATE POLICY "Users can update their own rooms"
  ON public.rooms FOR UPDATE
  USING (invite_code IN (
    SELECT invite_code FROM public.profiles WHERE id = auth.uid()
  ));

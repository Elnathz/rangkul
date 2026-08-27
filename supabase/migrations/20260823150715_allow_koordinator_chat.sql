CREATE POLICY "Koordinator can send or receive messages freely" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (SELECT 1 FROM public.users u WHERE u.id = sender_id AND u.role = 'koordinator')
      OR
      EXISTS (SELECT 1 FROM public.users u WHERE u.id = receiver_id AND u.role = 'koordinator')
    )
  );

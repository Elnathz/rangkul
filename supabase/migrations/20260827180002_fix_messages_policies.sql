-- Migration untuk memperbaiki broken policies di tabel messages (seperti "column chat_messages.user_id does not exist")
-- Script ini akan menghapus semua policy pada tabel messages dan membuat ulang yang benar.

DO $$
DECLARE
    pol record;
BEGIN
    -- 1. Hapus semua policy yang ada di tabel messages
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', pol.policyname);
    END LOOP;
END
$$;

-- 2. Buat ulang policy dari initial schema
CREATE POLICY "Users can read own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND task_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = messages.task_id
        AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
    )
  );

CREATE POLICY "Message receivers can mark read" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 3. Buat ulang policy dari koordinator chat
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

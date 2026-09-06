-- Semua task yang menunggu approval Koordinator harus memiliki batas waktu.
-- Row lama yang belum memiliki expires_at dibackfill supaya scheduler dapat
-- menutupnya dan policy tidak membiarkan approval tanpa deadline.

UPDATE public.tasks
SET
  expires_at = LEAST(jadwal_waktu, NOW() + INTERVAL '1 hour'),
  updated_at = NOW()
WHERE status = 'menunggu_persetujuan_koordinator'
  AND expires_at IS NULL;

DROP POLICY IF EXISTS "Koordinator can approve assigned tasks" ON public.tasks;
CREATE POLICY "Koordinator can approve assigned tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'menunggu_persetujuan_koordinator'
    AND expires_at > NOW()
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
      WHERE hp.id = tasks.helper_id AND kp.user_id = auth.uid() AND kp.status = 'verified'
    )
  )
  WITH CHECK (
    status = 'dikonfirmasi'
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
      WHERE hp.id = tasks.helper_id AND kp.user_id = auth.uid() AND kp.status = 'verified'
    )
  );

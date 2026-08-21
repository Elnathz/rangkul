-- Sprint 2: buka relasi yang dipakai antrean approval Koordinator.
-- Migration terpisah karena 20260821120000 sudah dapat tercatat di remote.

DROP POLICY IF EXISTS "Koordinator can read assigned task lansia" ON public.lansia_profiles;

CREATE POLICY "Koordinator can read assigned task lansia"
ON public.lansia_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks AS task
    JOIN public.helper_profiles AS hp ON hp.id = task.helper_id
    JOIN public.koordinator_profiles AS kp ON kp.id = hp.koordinator_id
    WHERE task.lansia_id = lansia_profiles.id
      AND task.status = 'menunggu_persetujuan_koordinator'
      AND kp.user_id = auth.uid()
      AND kp.status = 'verified'
  )
);

DROP POLICY IF EXISTS "Koordinator can approve assigned tasks" ON public.tasks;

CREATE POLICY "Koordinator can approve assigned tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  status = 'menunggu_persetujuan_koordinator'
  AND EXISTS (
    SELECT 1
    FROM public.helper_profiles AS hp
    JOIN public.koordinator_profiles AS kp ON kp.id = hp.koordinator_id
    WHERE hp.id = tasks.helper_id
      AND kp.user_id = auth.uid()
      AND kp.status = 'verified'
  )
)
WITH CHECK (
  status = 'dikonfirmasi'
  AND EXISTS (
    SELECT 1
    FROM public.helper_profiles AS hp
    JOIN public.koordinator_profiles AS kp ON kp.id = hp.koordinator_id
    WHERE hp.id = tasks.helper_id
      AND kp.user_id = auth.uid()
      AND kp.status = 'verified'
  )
);

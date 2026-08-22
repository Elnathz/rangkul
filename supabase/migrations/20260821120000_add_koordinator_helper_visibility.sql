-- Sprint 2: Koordinator dapat memantau Helper terverifikasi dan tugas aktifnya.
-- Scope dibatasi ke Helper yang ditautkan ke profil Koordinator yang sedang login.

CREATE POLICY "Koordinator can read assigned helper tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.helper_profiles AS hp
    JOIN public.koordinator_profiles AS kp ON kp.id = hp.koordinator_id
    WHERE hp.id = tasks.helper_id
      AND kp.user_id = auth.uid()
      AND kp.status = 'verified'
  )
);

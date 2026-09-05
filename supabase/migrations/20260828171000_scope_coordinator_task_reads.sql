DROP POLICY IF EXISTS "Koordinator can read assigned helper tasks" ON public.tasks;
DROP POLICY IF EXISTS "Koordinator can read scoped helper tasks" ON public.tasks;
CREATE POLICY "Koordinator can read scoped helper tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      WHERE hp.id = tasks.helper_id
        AND public.is_scoped_koordinator_for_user(hp.user_id)
    )
  );

DROP POLICY IF EXISTS "Koordinator can read assigned task lansia" ON public.lansia_profiles;
DROP POLICY IF EXISTS "Koordinator can read scoped approval lansia" ON public.lansia_profiles;
CREATE POLICY "Koordinator can read scoped approval lansia" ON public.lansia_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tasks task
      JOIN public.helper_profiles hp ON hp.id = task.helper_id
      WHERE task.lansia_id = lansia_profiles.id
        AND task.status = 'menunggu_persetujuan_koordinator'
        AND public.is_scoped_koordinator_for_user(hp.user_id)
    )
  );

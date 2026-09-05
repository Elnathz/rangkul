CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_koordinator_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid() AND role IN ('koordinator', 'admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_scoped_koordinator_for_user(p_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.koordinator_profiles kp
      JOIN public.users actor ON actor.id = kp.user_id
      JOIN public.users target ON target.id = p_target_user_id
      JOIN public.helper_profiles hp ON hp.user_id = target.id
      WHERE kp.user_id = auth.uid()
        AND kp.status = 'verified'
        AND LOWER(BTRIM(actor.kelurahan)) = LOWER(BTRIM(target.kelurahan))
        AND actor.rw = target.rw
        AND (
          kp.tingkat = 'rw'
          OR (kp.tingkat = 'rt' AND actor.rt = target.rt)
        )
        AND (
          hp.koordinator_id IS NULL
          OR hp.koordinator_id = kp.id
          OR kp.tingkat = 'rw'
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.is_task_participant(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = p_task_id
        AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_koordinator_or_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_scoped_koordinator_for_user(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_task_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_koordinator_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_scoped_koordinator_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_participant(UUID) TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can read profiles of verified helpers" ON public.users;
DROP POLICY IF EXISTS "Koordinator can read scoped helper users" ON public.users;
CREATE POLICY "Koordinator can read scoped helper users" ON public.users
  FOR SELECT TO authenticated
  USING (public.is_scoped_koordinator_for_user(id));

DROP POLICY IF EXISTS "Verified helper profiles readable" ON public.helper_profiles;
DROP POLICY IF EXISTS "Koordinator and admin can read helper profiles" ON public.helper_profiles;
DROP POLICY IF EXISTS "Helper can read own profile" ON public.helper_profiles;
DROP POLICY IF EXISTS "Admin can read helper profiles" ON public.helper_profiles;
DROP POLICY IF EXISTS "Koordinator can read scoped helper profiles" ON public.helper_profiles;
CREATE POLICY "Helper can read own profile" ON public.helper_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can read helper profiles" ON public.helper_profiles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Koordinator can read scoped helper profiles" ON public.helper_profiles
  FOR SELECT TO authenticated USING (public.is_scoped_koordinator_for_user(user_id));

DROP POLICY IF EXISTS "Authenticated users can read verified koordinator profiles" ON public.koordinator_profiles;

DROP POLICY IF EXISTS "Helper can read related lansia task details" ON public.lansia_profiles;
DROP POLICY IF EXISTS "Assigned helper can read task lansia" ON public.lansia_profiles;
CREATE POLICY "Assigned helper can read task lansia" ON public.lansia_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tasks t
      JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.lansia_id = lansia_profiles.id
        AND hp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Verified helper can read task marketplace" ON public.tasks;
DROP POLICY IF EXISTS "Helper can read assigned tasks" ON public.tasks;
CREATE POLICY "Helper can read assigned tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      WHERE hp.id = tasks.helper_id AND hp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Task participants can read messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Koordinator can send or receive messages freely" ON public.messages;
DROP POLICY IF EXISTS "Message receivers can mark read" ON public.messages;
DROP POLICY IF EXISTS "Task participants can mark messages read" ON public.messages;
CREATE POLICY "Task participants can read messages" ON public.messages
  FOR SELECT TO authenticated
  USING (task_id IS NOT NULL AND public.is_task_participant(task_id));
CREATE POLICY "Task participants can insert messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    task_id IS NOT NULL
    AND sender_id = auth.uid()
    AND receiver_id <> auth.uid()
    AND public.is_task_participant(task_id)
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = messages.task_id
        AND receiver_id IN (t.keluarga_id, hp.user_id)
    )
  );
CREATE POLICY "Task receivers can mark messages read" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    task_id IS NOT NULL
    AND receiver_id = auth.uid()
    AND public.is_task_participant(task_id)
  )
  WITH CHECK (
    task_id IS NOT NULL
    AND receiver_id = auth.uid()
    AND public.is_task_participant(task_id)
  );

DROP POLICY IF EXISTS "Scoped reviewers can read reports" ON public.reports;
DROP POLICY IF EXISTS "Scoped reviewers can update reports" ON public.reports;
CREATE POLICY "Scoped reviewers can read reports" ON public.reports
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.is_scoped_koordinator_for_user(reported_helper_id)
  );
CREATE POLICY "Scoped reviewers can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR public.is_scoped_koordinator_for_user(reported_helper_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.is_scoped_koordinator_for_user(reported_helper_id)
  );

DROP POLICY IF EXISTS "Admin can read task evidence" ON public.task_evidence;
CREATE POLICY "Admin can read task evidence" ON public.task_evidence
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can read health snapshots" ON public.health_snapshots;
CREATE POLICY "Admin can read health snapshots" ON public.health_snapshots
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated actor can insert audit logs" ON public.audit_logs;
REVOKE INSERT ON public.audit_logs FROM authenticated;

DO $$
DECLARE
  function_record RECORD;
BEGIN
  FOR function_record IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS identity_arguments
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format(
      'REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC',
      function_record.nspname,
      function_record.proname,
      function_record.identity_arguments
    );
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_koordinator_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_scoped_koordinator_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_participant(UUID) TO authenticated;

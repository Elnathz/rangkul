-- Hentikan infinite recursion RLS pada policy yang memakai subquery mentah
-- ke public.tasks.
--
-- Latar: PostgreSQL menolak re-entry evaluasi RLS pada relasi yang sama dalam
-- satu query. Query join (misal /api/koordinator/task-approvals: tasks JOIN
-- lansia_profiles JOIN helper_profiles JOIN users) memicu error:
--   ERROR: infinite recursion detected in policy for relation "tasks"
-- karena policy lansia_profiles / payments / dsb menyisipkan
-- "SELECT ... FROM public.tasks ..." saat tasks sedang dievaluasi RLS.
--
-- Perbaikan: semua cek lintas tabel yang membuktikan kepemilikan/partisipasi
-- dipindah ke fungsi SECURITY DEFINER (bypass RLS), pola yang sama dengan
-- is_task_participant() / is_scoped_koordinator_for_user(). Semantik tiap
-- policy dipertahankan persis.

-- ---------------------------------------------------------------------------
-- 1. Fungsi SECURITY DEFINER
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_task_owner(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks
      WHERE id = p_task_id AND keluarga_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_task_receiver(p_task_id UUID, p_receiver_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND p_receiver_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = p_task_id
        AND p_receiver_id IN (t.keluarga_id, hp.user_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.is_task_paid(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.payments
      WHERE task_id = p_task_id AND status IN ('held_escrow', 'released')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_task_payment_participant(p_payment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.payments p
      JOIN public.tasks t ON t.id = p.task_id
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE p.id = p_payment_id
        AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION public.is_emergency_alert_participant(p_alert_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.emergency_alerts e
      JOIN public.tasks t ON t.id = e.task_id
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      LEFT JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
      WHERE e.id = p_alert_id
        AND (
          t.keluarga_id = auth.uid()
          OR hp.user_id = auth.uid()
          OR (kp.user_id = auth.uid() AND kp.status = 'verified')
          OR public.is_admin()
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.is_emergency_trigger_authorized(p_alert_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.emergency_alerts e
      JOIN public.tasks t ON t.id = e.task_id
      JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE e.id = p_alert_id
        AND hp.user_id = auth.uid()
        AND t.status = 'dikerjakan'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_emergency_ack_authorized(p_alert_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.emergency_alerts e
      JOIN public.tasks t ON t.id = e.task_id
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      LEFT JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
      WHERE e.id = p_alert_id
        AND (
          t.keluarga_id = auth.uid()
          OR (kp.user_id = auth.uid() AND kp.status = 'verified')
          OR public.is_admin()
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_helper_for_lansia(p_lansia_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.lansia_id = p_lansia_id
        AND hp.user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_koordinator_approval_lansia(p_lansia_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks task
      JOIN public.helper_profiles hp ON hp.id = task.helper_id
      WHERE task.lansia_id = p_lansia_id
        AND task.status = 'menunggu_persetujuan_koordinator'
        AND public.is_scoped_koordinator_for_user(hp.user_id)
    );
$$;

REVOKE ALL ON FUNCTION public.is_task_owner(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_task_receiver(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_task_paid(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_task_payment_participant(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_emergency_alert_participant(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_emergency_trigger_authorized(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_emergency_ack_authorized(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_assigned_helper_for_lansia(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_koordinator_approval_lansia(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_task_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_receiver(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_payment_participant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_emergency_alert_participant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_emergency_trigger_authorized(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_emergency_ack_authorized(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_helper_for_lansia(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_koordinator_approval_lansia(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. tasks: policy start tugas tidak lagi menyentuh payments mentah. Cek
--    escrow dipindah ke is_task_paid() supaya evaluasi RLS tasks tidak
--    memicu evaluasi RLS payments yang membalas menyentuh tasks.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Verified helper can start confirmed tasks" ON public.tasks;
CREATE POLICY "Verified helper can start confirmed tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'dikonfirmasi'
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles helper
      WHERE helper.id = tasks.helper_id
        AND helper.user_id = auth.uid()
        AND helper.status = 'verified'
    )
    AND public.is_task_paid(tasks.id)
  )
  WITH CHECK (
    status = 'dikerjakan'
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles helper
      WHERE helper.id = tasks.helper_id
        AND helper.user_id = auth.uid()
        AND helper.status = 'verified'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. lansia_profiles: dua policy yang membuktikan akses via tasks dipindah ke
--    fungsi SECURITY DEFINER.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Assigned helper can read task lansia" ON public.lansia_profiles;
CREATE POLICY "Assigned helper can read task lansia" ON public.lansia_profiles
  FOR SELECT TO authenticated
  USING (public.is_assigned_helper_for_lansia(id));

DROP POLICY IF EXISTS "Koordinator can read scoped approval lansia" ON public.lansia_profiles;
CREATE POLICY "Koordinator can read scoped approval lansia" ON public.lansia_profiles
  FOR SELECT TO authenticated
  USING (public.is_koordinator_approval_lansia(id));

-- ---------------------------------------------------------------------------
-- 4. task_extra_services, task_evidence, health_snapshots, payments:
--    keikutsertaan task dibuktikan lewat is_task_participant() / is_task_owner().
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Keluarga can insert extra services" ON public.task_extra_services;
CREATE POLICY "Keluarga can insert extra services" ON public.task_extra_services
  FOR INSERT TO authenticated
  WITH CHECK (public.is_task_owner(task_id));

DROP POLICY IF EXISTS "Keluarga can select extra services" ON public.task_extra_services;
CREATE POLICY "Keluarga can select extra services" ON public.task_extra_services
  FOR SELECT TO authenticated
  USING (public.is_task_owner(task_id));

DROP POLICY IF EXISTS "Task participants can read extra services" ON public.task_extra_services;
CREATE POLICY "Task participants can read extra services" ON public.task_extra_services
  FOR SELECT TO authenticated
  USING (public.is_task_participant(task_id));

DROP POLICY IF EXISTS "Task participants can read task evidence" ON public.task_evidence;
CREATE POLICY "Task participants can read task evidence" ON public.task_evidence
  FOR SELECT TO authenticated
  USING (public.is_task_participant(task_id));

DROP POLICY IF EXISTS "Task participants can read health snapshots" ON public.health_snapshots;
CREATE POLICY "Task participants can read health snapshots" ON public.health_snapshots
  FOR SELECT TO authenticated
  USING (public.is_task_participant(task_id));

DROP POLICY IF EXISTS "Payment participants can read payments" ON public.payments;
CREATE POLICY "Payment participants can read payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.is_task_participant(task_id));

DROP POLICY IF EXISTS "Payment participants can read transaction logs" ON public.transaction_logs;
CREATE POLICY "Payment participants can read transaction logs" ON public.transaction_logs
  FOR SELECT TO authenticated
  USING (public.is_task_payment_participant(payment_id));

-- ---------------------------------------------------------------------------
-- 5. messages: penerima pesan tetap divalidasi, tapi lewat is_task_receiver().
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Task participants can insert messages" ON public.messages;
CREATE POLICY "Task participants can insert messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    task_id IS NOT NULL
    AND sender_id = auth.uid()
    AND receiver_id <> auth.uid()
    AND public.is_task_participant(task_id)
    AND public.is_task_receiver(task_id, receiver_id)
  );

-- ---------------------------------------------------------------------------
-- 6. emergency_alerts: semua lintasan yang membuktikan partisipasi tugas
--    dipindah ke fungsi SECURITY DEFINER.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Scoped participants can read emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Scoped participants can read emergency alerts" ON public.emergency_alerts
  FOR SELECT TO authenticated
  USING (public.is_emergency_alert_participant(id));

DROP POLICY IF EXISTS "Assigned helpers can trigger emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Assigned helpers can trigger emergency alerts" ON public.emergency_alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = triggered_by
    AND public.is_emergency_trigger_authorized(id)
  );

DROP POLICY IF EXISTS "Emergency contacts can acknowledge alerts" ON public.emergency_alerts;
CREATE POLICY "Emergency contacts can acknowledge alerts" ON public.emergency_alerts
  FOR UPDATE TO authenticated
  USING (public.is_emergency_ack_authorized(id))
  WITH CHECK (acknowledged_by = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. task_applications: Keluarga hanya membaca lamaran pada tasks-nya sendiri
--    lewat is_task_owner().
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Keluarga can read applications on own tasks" ON public.task_applications;
CREATE POLICY "Keluarga can read applications on own tasks" ON public.task_applications
  FOR SELECT TO authenticated
  USING (public.is_task_owner(task_id));
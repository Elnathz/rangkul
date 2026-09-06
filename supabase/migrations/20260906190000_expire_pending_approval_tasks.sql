-- Approval Koordinator memakai expires_at yang sama dengan jendela penerimaan.
-- Task yang lewat batas tidak boleh tetap menggantung di antrean atau disetujui.

CREATE OR REPLACE FUNCTION public.expire_pending_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task RECORD;
  expired_count INTEGER := 0;
BEGIN
  FOR v_task IN
    UPDATE public.tasks AS task
    SET
      status = 'dibatalkan',
      cancelled_at = COALESCE(task.cancelled_at, NOW()),
      cancellation_reason = CASE
        WHEN task.status = 'menunggu_persetujuan_koordinator' THEN
          'Kunjungan otomatis dibatalkan karena persetujuan Koordinator melewati batas waktu.'
        ELSE
          COALESCE(task.cancellation_reason, 'Tugas otomatis dibatalkan karena tidak diterima dalam 1 jam.')
      END,
      updated_at = NOW()
    WHERE task.status IN ('diajukan', 'menunggu_persetujuan_koordinator')
      AND task.expires_at IS NOT NULL
      AND task.expires_at <= NOW()
    RETURNING task.id, task.keluarga_id, task.cancellation_reason
  LOOP
    expired_count := expired_count + 1;
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
      v_task.keluarga_id,
      'Kunjungan kedaluwarsa',
      v_task.cancellation_reason,
      'task'::public.notification_type
    );
  END LOOP;

  RETURN expired_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_pending_tasks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_pending_tasks() TO service_role;

DROP POLICY IF EXISTS "Koordinator can approve assigned tasks" ON public.tasks;
CREATE POLICY "Koordinator can approve assigned tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'menunggu_persetujuan_koordinator'
    AND (expires_at IS NULL OR expires_at > NOW())
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

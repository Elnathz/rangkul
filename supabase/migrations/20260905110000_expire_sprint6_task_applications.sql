-- Expiry menjaga state task dan lamaran selaras. Lamaran pending pada task
-- yang dibatalkan tidak boleh tetap tampil sebagai lamaran aktif untuk Helper.

CREATE OR REPLACE FUNCTION public.expire_unassigned_tasks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  WITH expired AS (
    UPDATE public.tasks
    SET status = 'dibatalkan'::public.task_status,
        cancellation_reason = 'Waktu pencarian kedaluwarsa (tidak ada Helper)',
        cancelled_at = NOW(),
        updated_at = NOW()
    WHERE status = 'diajukan'::public.task_status
      AND helper_id IS NULL
      AND expires_at IS NOT NULL
      AND expires_at <= NOW()
    RETURNING id
  ), closed_applications AS (
    UPDATE public.task_applications application
    SET status = 'expired'::public.task_application_status,
        diputus_at = NOW()
    WHERE application.task_id IN (SELECT id FROM expired)
      AND application.status = 'pending'::public.task_application_status
    RETURNING application.id
  )
  SELECT count(*) INTO v_count FROM expired;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_unassigned_tasks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_unassigned_tasks() TO service_role;

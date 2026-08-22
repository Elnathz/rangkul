-- Sprint 2: pembatalan dan reschedule yang mengikuti aturan waktu TDD.

CREATE OR REPLACE FUNCTION public.cancel_task(p_task_id UUID, p_cancellation_reason TEXT)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk membatalkan tugas' USING ERRCODE = '42501';
  END IF;

  IF NULLIF(BTRIM(p_cancellation_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Alasan pembatalan wajib diisi' USING ERRCODE = '22023';
  END IF;

  UPDATE public.tasks
  SET status = 'dibatalkan',
      cancellation_reason = BTRIM(p_cancellation_reason),
      cancelled_at = NOW(),
      updated_at = NOW()
  WHERE id = p_task_id
    AND keluarga_id = auth.uid()
    AND status IN ('diajukan', 'menunggu_persetujuan_koordinator', 'dikonfirmasi')
  RETURNING * INTO v_task;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibatalkan pada status saat ini' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_task;
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_task(p_task_id UUID, p_jadwal_waktu TIMESTAMPTZ)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_hours_to_original NUMERIC;
  v_minimum_lead INTERVAL;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk mengubah jadwal' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
    AND keluarga_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak ditemukan atau bukan milik keluarga ini' USING ERRCODE = '42501';
  END IF;

  IF v_task.status NOT IN ('diajukan', 'dikonfirmasi') THEN
    RAISE EXCEPTION 'Tugas tidak dapat dijadwalkan ulang pada status saat ini' USING ERRCODE = 'P0001';
  END IF;

  IF v_task.reschedule_count >= 2 THEN
    RAISE EXCEPTION 'Batas reschedule tugas sudah tercapai' USING ERRCODE = 'P0001';
  END IF;

  IF p_jadwal_waktu <= NOW() THEN
    RAISE EXCEPTION 'Jadwal baru harus berada di masa depan' USING ERRCODE = '22023';
  END IF;

  v_hours_to_original := EXTRACT(EPOCH FROM (v_task.jadwal_waktu - NOW())) / 3600;
  v_minimum_lead := CASE WHEN v_hours_to_original >= 24 THEN INTERVAL '3 hours' ELSE INTERVAL '2 hours' END;

  IF p_jadwal_waktu < NOW() + v_minimum_lead THEN
    RAISE EXCEPTION 'Jadwal baru harus berjarak minimal % dari sekarang', v_minimum_lead USING ERRCODE = '22023';
  END IF;

  UPDATE public.tasks
  SET jadwal_waktu_asli = COALESCE(jadwal_waktu_asli, jadwal_waktu),
      jadwal_waktu = p_jadwal_waktu,
      reschedule_count = reschedule_count + 1,
      updated_at = NOW()
  WHERE id = p_task_id
  RETURNING * INTO v_task;

  RETURN v_task;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_task(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_task(UUID, TIMESTAMPTZ) TO authenticated;

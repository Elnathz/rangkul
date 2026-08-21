-- Atomic extra-service flow for Sprint 3.
-- Mutations go through SECURITY DEFINER functions with explicit auth checks.

DROP POLICY IF EXISTS "Task participants can read extra services" ON public.task_extra_services;
CREATE POLICY "Task participants can read extra services"
ON public.task_extra_services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = task_extra_services.task_id
      AND (
        t.keluarga_id = auth.uid()
        OR hp.user_id = auth.uid()
      )
  )
);

CREATE OR REPLACE FUNCTION public.create_extra_service(
  p_task_id UUID,
  p_nama_layanan TEXT,
  p_biaya NUMERIC
)
RETURNS public.task_extra_services
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service public.task_extra_services;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk mengajukan layanan tambahan'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(BTRIM(p_nama_layanan), '') IS NULL THEN
    RAISE EXCEPTION 'Nama layanan tambahan wajib diisi'
      USING ERRCODE = '22023';
  END IF;

  IF p_biaya IS NULL OR p_biaya <= 0 THEN
    RAISE EXCEPTION 'Biaya layanan tambahan harus lebih dari nol'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.tasks t
  JOIN public.helper_profiles hp ON hp.id = t.helper_id
  WHERE t.id = p_task_id
    AND hp.user_id = auth.uid()
    AND t.status = 'dikerjakan'
  FOR UPDATE OF t;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak sedang dikerjakan oleh Helper ini'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.task_extra_services (task_id, nama_layanan, biaya)
  VALUES (p_task_id, BTRIM(p_nama_layanan), p_biaya)
  RETURNING * INTO v_service;

  UPDATE public.tasks
  SET status = 'menunggu_persetujuan_keluarga',
      updated_at = NOW()
  WHERE id = p_task_id
    AND status = 'dikerjakan';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status tugas sudah berubah'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN v_service;
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_extra_service(
  p_task_id UUID,
  p_extra_service_id UUID,
  p_decision TEXT
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_approved_total NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk memutuskan layanan tambahan'
      USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('disetujui', 'ditolak') THEN
    RAISE EXCEPTION 'Keputusan layanan tambahan tidak valid'
      USING ERRCODE = '22023';
  END IF;

  SELECT t.*
  INTO v_task
  FROM public.tasks t
  JOIN public.task_extra_services es ON es.task_id = t.id
  WHERE t.id = p_task_id
    AND es.id = p_extra_service_id
    AND t.keluarga_id = auth.uid()
    AND t.status = 'menunggu_persetujuan_keluarga'
    AND es.status = 'menunggu_persetujuan_keluarga'
  FOR UPDATE OF t;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan layanan tambahan sudah diproses atau tidak dapat diakses'
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.task_extra_services
  SET status = p_decision::public.extra_service_status
  WHERE id = p_extra_service_id
    AND task_id = p_task_id
    AND status = 'menunggu_persetujuan_keluarga';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan layanan tambahan baru saja diproses'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_decision = 'disetujui' THEN
    SELECT COALESCE(SUM(biaya) FILTER (WHERE status = 'disetujui'), 0)
    INTO v_approved_total
    FROM public.task_extra_services
    WHERE task_id = p_task_id;

    UPDATE public.tasks
    SET harga_final = harga_dasar + v_approved_total,
        status = 'dikerjakan',
        updated_at = NOW()
    WHERE id = p_task_id;
  ELSE
    UPDATE public.tasks
    SET status = 'dikerjakan',
        updated_at = NOW()
    WHERE id = p_task_id;
  END IF;

  SELECT *
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id;

  RETURN v_task;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_extra_service(UUID, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_extra_service(UUID, UUID, TEXT) TO authenticated;

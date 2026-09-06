-- Marketplace hanya boleh menghitung eligibility untuk Helper yang sedang login.
-- Parameter actor lama dapat dipalsukan saat RPC dipanggil langsung.

DROP FUNCTION IF EXISTS public.get_task_marketplace(uuid, text, integer);

CREATE OR REPLACE FUNCTION public.get_task_marketplace(
  p_mode text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  task_id uuid,
  mode_penugasan text,
  kategori_id uuid,
  kategori_nama text,
  estimasi_durasi_menit integer,
  jadwal_waktu timestamptz,
  harga_dasar numeric,
  harga_final numeric,
  kelurahan text,
  kecamatan text,
  jarak_km numeric,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_helper record;
BEGIN
  IF v_user_id IS NULL OR auth.role() <> 'authenticated' THEN
    RETURN;
  END IF;

  SELECT id, status, is_available, tingkat_kepercayaan,
         domisili_lat, domisili_lng, radius_layanan_km
  INTO v_helper
  FROM public.helper_profiles
  WHERE user_id = v_user_id;

  IF NOT FOUND OR v_helper.status <> 'verified' OR NOT v_helper.is_available THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    task.id,
    task.mode_penugasan::text,
    category.id,
    category.nama,
    category.estimasi_durasi_menit,
    task.jadwal_waktu,
    task.harga_dasar::numeric,
    task.harga_final::numeric,
    'Sekitar'::text,
    'Wilayah Helper'::text,
    ROUND((public.haversine_distance_km(v_helper.domisili_lat, v_helper.domisili_lng, lansia.lat, lansia.lng) * 2)::numeric) / 2,
    task.expires_at
  FROM public.tasks task
  JOIN public.service_categories category ON category.id = task.service_category_id
  JOIN public.lansia_profiles lansia ON lansia.id = task.lansia_id
  WHERE task.status = 'diajukan'
    AND task.helper_id IS NULL
    AND task.expires_at > NOW()
    AND task.mode_penugasan IN ('pelamar'::public.task_assignment_mode, 'cepat'::public.task_assignment_mode)
    AND (p_mode IS NULL OR task.mode_penugasan::text = p_mode)
    AND EXISTS (
      SELECT 1
      FROM public.helper_service_categories supported_category
      WHERE supported_category.helper_id = v_helper.id
        AND supported_category.service_category_id = task.service_category_id
    )
    AND (task.mode_penugasan <> 'cepat'::public.task_assignment_mode OR category.is_high_risk = FALSE)
    AND (task.mode_penugasan <> 'cepat'::public.task_assignment_mode OR v_helper.tingkat_kepercayaan = 'terpercaya')
    AND (task.mode_penugasan <> 'cepat'::public.task_assignment_mode OR task.jadwal_waktu::date = NOW()::date)
    AND public.haversine_distance_km(v_helper.domisili_lat, v_helper.domisili_lng, lansia.lat, lansia.lng) <= COALESCE(v_helper.radius_layanan_km, 10)
  ORDER BY task.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 50);
END;
$$;

REVOKE ALL ON FUNCTION public.get_task_marketplace(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_task_marketplace(text, integer) TO authenticated;

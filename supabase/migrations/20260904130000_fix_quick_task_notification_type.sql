-- Sprint 6 repair: accept Cari Cepat must revalidate every eligibility rule
-- at the transaction boundary and use the existing notification enum.

CREATE OR REPLACE FUNCTION public.accept_quick_task(
  p_task_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_helper record;
  v_task record;
  v_category record;
  v_lansia record;
  v_distance double precision;
  v_has_overlap boolean;
  v_updated integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'code', 'unauthorized', 'message', 'Anda harus login');
  END IF;

  SELECT id, user_id, status, is_available, tingkat_kepercayaan,
         domisili_lat, domisili_lng, radius_layanan_km
  INTO v_helper
  FROM public.helper_profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_helper.status != 'verified' THEN
    RETURN json_build_object('success', false, 'code', 'helper_not_verified', 'message', 'Helper belum terverifikasi atau sedang dinonaktifkan');
  END IF;

  IF v_helper.tingkat_kepercayaan != 'terpercaya' THEN
    RETURN json_build_object('success', false, 'code', 'trust_tier_not_allowed', 'message', 'Cari Cepat hanya tersedia untuk Helper Terpercaya');
  END IF;

  IF NOT v_helper.is_available THEN
    RETURN json_build_object('success', false, 'code', 'helper_not_available', 'message', 'Aktifkan ketersediaan sebelum menerima tugas');
  END IF;

  SELECT id, status, helper_id, mode_penugasan, service_category_id,
         lansia_id, jadwal_waktu, expires_at, keluarga_id
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'code', 'task_not_found', 'message', 'Tugas tidak ditemukan');
  END IF;

  IF v_task.mode_penugasan != 'cepat' THEN
    RETURN json_build_object('success', false, 'code', 'mode_not_allowed', 'message', 'Tugas ini tidak tersedia untuk Cari Cepat');
  END IF;

  IF v_task.status != 'diajukan' OR v_task.helper_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'code', 'task_not_available', 'message', 'Tugas sudah tidak tersedia');
  END IF;

  IF v_task.expires_at IS NULL OR v_task.expires_at <= NOW() THEN
    RETURN json_build_object('success', false, 'code', 'task_expired', 'message', 'Waktu pencarian tugas telah berakhir');
  END IF;

  IF v_task.jadwal_waktu::date != NOW()::date THEN
    RETURN json_build_object('success', false, 'code', 'mode_not_allowed', 'message', 'Cari Cepat hanya tersedia untuk kunjungan hari ini');
  END IF;

  SELECT id, is_high_risk, estimasi_durasi_menit
  INTO v_category
  FROM public.service_categories
  WHERE id = v_task.service_category_id;

  IF NOT FOUND OR v_category.is_high_risk THEN
    RETURN json_build_object('success', false, 'code', 'high_risk_not_allowed', 'message', 'Layanan ini tidak tersedia untuk Cari Cepat');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.helper_service_categories
    WHERE helper_id = v_helper.id
      AND service_category_id = v_task.service_category_id
  ) THEN
    RETURN json_build_object('success', false, 'code', 'category_not_served', 'message', 'Layanan ini tidak ada dalam jangkauan layanan Anda');
  END IF;

  SELECT lat, lng
  INTO v_lansia
  FROM public.lansia_profiles
  WHERE id = v_task.lansia_id;

  IF NOT FOUND
    OR v_lansia.lat IS NULL
    OR v_lansia.lng IS NULL
    OR v_helper.domisili_lat IS NULL
    OR v_helper.domisili_lng IS NULL THEN
    RETURN json_build_object('success', false, 'code', 'location_incomplete', 'message', 'Lokasi belum lengkap untuk memeriksa radius layanan');
  END IF;

  v_distance := public.haversine_distance_km(
    v_helper.domisili_lat,
    v_helper.domisili_lng,
    v_lansia.lat,
    v_lansia.lng
  );

  IF v_distance > COALESCE(v_helper.radius_layanan_km, 10) THEN
    RETURN json_build_object('success', false, 'code', 'outside_radius', 'message', 'Lokasi tugas berada di luar radius layanan Anda');
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.tasks active_task
    JOIN public.service_categories active_category ON active_category.id = active_task.service_category_id
    WHERE active_task.helper_id = v_helper.id
      AND active_task.status IN ('menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dikerjakan')
      AND (
        (active_task.jadwal_waktu, active_task.jadwal_waktu + (COALESCE(active_category.estimasi_durasi_menit, 60) || ' minutes')::interval)
        OVERLAPS
        (v_task.jadwal_waktu, v_task.jadwal_waktu + (COALESCE(v_category.estimasi_durasi_menit, 60) || ' minutes')::interval)
      )
  ) INTO v_has_overlap;

  IF v_has_overlap THEN
    RETURN json_build_object('success', false, 'code', 'schedule_conflict', 'message', 'Jadwal tugas ini bentrok dengan tugas aktif Anda');
  END IF;

  UPDATE public.tasks
  SET helper_id = v_helper.id,
      status = 'dikonfirmasi'::public.task_status,
      confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_task_id
    AND status = 'diajukan'
    AND helper_id IS NULL
    AND mode_penugasan = 'cepat'::public.task_assignment_mode;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RETURN json_build_object('success', false, 'code', 'race_condition_lost', 'message', 'Tugas sudah diambil oleh Helper lain');
  END IF;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (
    v_task.keluarga_id,
    'Helper ditemukan',
    'Seorang Helper Terpercaya telah menerima tugas Cari Cepat Anda.',
    'task'
  );

  RETURN json_build_object('success', true, 'message', 'Tugas berhasil diterima', 'task_id', p_task_id);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_quick_task(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_quick_task(uuid) TO authenticated;

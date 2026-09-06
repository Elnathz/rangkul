-- Keluarga memilih pelamar melalui transaksi yang menghitung ulang semua
-- eligibility. Status pending dari masa lalu bukan otorisasi untuk assignment.

CREATE OR REPLACE FUNCTION public.select_task_application(
  p_task_id uuid,
  p_application_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_task record;
  v_application record;
  v_helper record;
  v_category record;
  v_lansia record;
  v_distance double precision;
  v_has_overlap boolean;
  v_next_status public.task_status;
  v_updated integer;
BEGIN
  IF v_user_id IS NULL OR auth.role() <> 'authenticated' THEN
    RETURN json_build_object('success', false, 'code', 'unauthorized', 'message', 'Anda harus login');
  END IF;

  SELECT id, status, keluarga_id, helper_id, mode_penugasan, service_category_id,
         lansia_id, jadwal_waktu, expires_at
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'code', 'task_not_found', 'message', 'Tugas tidak ditemukan');
  END IF;

  IF v_task.keluarga_id <> v_user_id THEN
    RETURN json_build_object('success', false, 'code', 'forbidden', 'message', 'Anda bukan pemilik tugas ini');
  END IF;

  IF v_task.mode_penugasan <> 'pelamar'::public.task_assignment_mode THEN
    RETURN json_build_object('success', false, 'code', 'mode_not_allowed', 'message', 'Tugas ini tidak memakai mode Pelamar');
  END IF;

  IF v_task.status <> 'diajukan' OR v_task.helper_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'code', 'task_already_assigned', 'message', 'Tugas ini sudah terisi oleh Helper lain');
  END IF;

  IF v_task.expires_at IS NULL OR v_task.expires_at <= NOW() THEN
    RETURN json_build_object('success', false, 'code', 'task_expired', 'message', 'Batas waktu pelamar telah berakhir');
  END IF;

  SELECT id, task_id, helper_id, status
  INTO v_application
  FROM public.task_applications
  WHERE id = p_application_id
    AND task_id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'code', 'application_not_found', 'message', 'Lamaran tidak ditemukan');
  END IF;

  IF v_application.status <> 'pending'::public.task_application_status THEN
    RETURN json_build_object('success', false, 'code', 'application_not_pending', 'message', 'Lamaran ini sudah tidak aktif');
  END IF;

  SELECT id, user_id, status, is_available, tingkat_kepercayaan,
         domisili_lat, domisili_lng, radius_layanan_km
  INTO v_helper
  FROM public.helper_profiles
  WHERE id = v_application.helper_id
  FOR UPDATE;

  IF NOT FOUND OR v_helper.status <> 'verified' OR NOT v_helper.is_available THEN
    RETURN json_build_object('success', false, 'code', 'helper_no_longer_eligible', 'message', 'Helper sudah tidak aktif atau tidak tersedia');
  END IF;

  SELECT id, is_high_risk, estimasi_durasi_menit
  INTO v_category
  FROM public.service_categories
  WHERE id = v_task.service_category_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'code', 'category_not_found', 'message', 'Kategori layanan tidak tersedia');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.helper_service_categories supported_category
    WHERE supported_category.helper_id = v_helper.id
      AND supported_category.service_category_id = v_task.service_category_id
  ) THEN
    RETURN json_build_object('success', false, 'code', 'category_not_served', 'message', 'Helper tidak melayani kategori ini');
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
    RETURN json_build_object('success', false, 'code', 'outside_radius', 'message', 'Lokasi tugas berada di luar radius layanan Helper');
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
    RETURN json_build_object('success', false, 'code', 'schedule_conflict', 'message', 'Jadwal Helper bentrok dengan tugas aktif');
  END IF;

  IF v_helper.tingkat_kepercayaan = 'probation' OR v_category.is_high_risk THEN
    v_next_status := 'menunggu_persetujuan_koordinator'::public.task_status;
  ELSE
    v_next_status := 'dikonfirmasi'::public.task_status;
  END IF;

  UPDATE public.tasks
  SET helper_id = v_helper.id,
      status = v_next_status,
      confirmed_at = CASE WHEN v_next_status = 'dikonfirmasi'::public.task_status THEN NOW() ELSE NULL END,
      updated_at = NOW()
  WHERE id = p_task_id
    AND status = 'diajukan'
    AND helper_id IS NULL
    AND mode_penugasan = 'pelamar'::public.task_assignment_mode;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN json_build_object('success', false, 'code', 'race_condition_lost', 'message', 'Tugas sudah diambil oleh Helper lain');
  END IF;

  UPDATE public.task_applications
  SET status = CASE
        WHEN id = p_application_id THEN 'selected'::public.task_application_status
        ELSE 'rejected'::public.task_application_status
      END,
      diputus_at = NOW()
  WHERE task_id = p_task_id
    AND status = 'pending'::public.task_application_status;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (
    v_helper.user_id,
    'Anda dipilih',
    'Keluarga telah memilih Anda untuk tugas pendampingan.',
    'task'
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Helper berhasil dipilih',
    'task_id', p_task_id,
    'status', v_next_status::text,
    'helper_id', v_helper.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.select_task_application(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.select_task_application(uuid, uuid) TO authenticated;

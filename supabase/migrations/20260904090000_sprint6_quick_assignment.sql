-- Migration: Sprint 6 Quick Assignment & Marketplace Projection

-- 1. Create task_assignment_mode enum if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_assignment_mode') THEN
        CREATE TYPE public.task_assignment_mode AS ENUM ('langsung', 'pelamar', 'cepat');
    END IF;
END $$;

-- 2. Add mode_penugasan to tasks if not exists
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS mode_penugasan public.task_assignment_mode DEFAULT 'langsung'::public.task_assignment_mode NOT NULL;

-- 3. Function to calculate distance between coordinates (Haversine in km)
CREATE OR REPLACE FUNCTION public.haversine_distance_km(
    lat1 double precision,
    lng1 double precision,
    lat2 double precision,
    lng2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    r double precision := 6371.0; -- Earth radius in km
    dlat double precision;
    dlng double precision;
    a double precision;
    c double precision;
BEGIN
    IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
        RETURN 99999.0;
    END IF;
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN r * c;
END;
$$;

-- 4. RPC for Helper marketplace projection (reduced fields, privacy compliant)
CREATE OR REPLACE FUNCTION public.get_task_marketplace(
    p_helper_user_id uuid,
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
    v_helper record;
BEGIN
    -- Find helper profile
    SELECT id, user_id, status, is_available, tingkat_kepercayaan, domisili_lat, domisili_lng, radius_layanan_km
    INTO v_helper
    FROM public.helper_profiles
    WHERE user_id = p_helper_user_id;

    IF NOT FOUND OR v_helper.status != 'verified' OR NOT v_helper.is_available THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        t.id AS task_id,
        t.mode_penugasan::text,
        sc.id AS kategori_id,
        sc.nama AS kategori_nama,
        sc.estimasi_durasi_menit,
        t.jadwal_waktu,
        t.harga_dasar::numeric,
        t.harga_final::numeric,
        'Sekitar'::text AS kelurahan,
        'Wilayah Helper'::text AS kecamatan,
        ROUND((public.haversine_distance_km(v_helper.domisili_lat, v_helper.domisili_lng, lp.lat, lp.lng) * 2)::numeric) / 2 AS jarak_km,
        t.expires_at
    FROM public.tasks t
    JOIN public.service_categories sc ON sc.id = t.service_category_id
    JOIN public.lansia_profiles lp ON lp.id = t.lansia_id
    WHERE t.status = 'diajukan'
      AND (t.expires_at IS NULL OR t.expires_at > NOW())
      AND t.helper_id IS NULL
      AND (p_mode IS NULL OR t.mode_penugasan::text = p_mode)
      -- Exclude high risk for quick mode
      AND (t.mode_penugasan != 'cepat' OR sc.is_high_risk = FALSE)
      -- Helper must be trusted for quick mode
      AND (t.mode_penugasan != 'cepat' OR v_helper.tingkat_kepercayaan = 'terpercaya')
      -- Radius check
      AND public.haversine_distance_km(v_helper.domisili_lat, v_helper.domisili_lng, lp.lat, lp.lng) <= COALESCE(v_helper.radius_layanan_km, 10)
    ORDER BY t.created_at DESC
    LIMIT p_limit;
END;
$$;

-- 5. RPC for quick assignment acceptance (conditional update with race condition safety)
CREATE OR REPLACE FUNCTION public.accept_quick_task(
    p_task_id uuid,
    p_helper_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_helper record;
    v_task record;
    v_updated integer;
BEGIN
    -- 1. Find and lock helper
    SELECT id, user_id, status, is_available, tingkat_kepercayaan
    INTO v_helper
    FROM public.helper_profiles
    WHERE user_id = p_helper_user_id
    FOR UPDATE;

    IF NOT FOUND OR v_helper.status != 'verified' THEN
        RETURN json_build_object('success', false, 'code', 'helper_not_verified', 'message', 'Helper tidak terverifikasi');
    END IF;

    IF v_helper.tingkat_kepercayaan != 'terpercaya' THEN
        RETURN json_build_object('success', false, 'code', 'trust_tier_not_allowed', 'message', 'Mode Cari Cepat hanya untuk Helper Terpercaya');
    END IF;

    IF NOT v_helper.is_available THEN
        RETURN json_build_object('success', false, 'code', 'helper_not_available', 'message', 'Status Helper sedang tidak aktif');
    END IF;

    -- 2. Lock task row
    SELECT id, status, helper_id, mode_penugasan, expires_at, keluarga_id
    INTO v_task
    FROM public.tasks
    WHERE id = p_task_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'code', 'task_not_found', 'message', 'Tugas tidak ditemukan');
    END IF;

    IF v_task.status != 'diajukan' OR v_task.helper_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'code', 'task_already_assigned', 'message', 'Tugas ini sudah diambil oleh Helper lain');
    END IF;

    IF v_task.expires_at IS NOT NULL AND v_task.expires_at <= NOW() THEN
        RETURN json_build_object('success', false, 'code', 'task_expired', 'message', 'Waktu pencarian tugas ini telah kedaluwarsa');
    END IF;

    -- 3. Atomic conditional update
    UPDATE public.tasks
    SET helper_id = v_helper.id,
        status = 'dikonfirmasi',
        updated_at = NOW()
    WHERE id = p_task_id
      AND status = 'diajukan'
      AND helper_id IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN json_build_object('success', false, 'code', 'race_condition_lost', 'message', 'Tugas sudah diambil oleh Helper lain');
    END IF;

    -- 4. Create notification for Keluarga
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
        v_task.keluarga_id,
        'Helper Ditemukan!',
        'Seorang Helper Terpercaya telah menerima tugas Cari Cepat Anda.',
        'task_accepted'
    );

    RETURN json_build_object('success', true, 'message', 'Tugas berhasil diterima!', 'task_id', p_task_id);
END;
$$;

-- 6. RPC for expiring unassigned tasks
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
        SET status = 'dibatalkan',
            cancellation_reason = 'Waktu pencarian kedaluwarsa (tidak ada Helper)',
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE status = 'diajukan'
          AND helper_id IS NULL
          AND expires_at <= NOW()
        RETURNING id, keluarga_id
    )
    SELECT count(*) INTO v_count FROM expired;

    RETURN v_count;
END;
$$;

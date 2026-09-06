-- Migration: Sprint 6 Task Applications & Boundary Hardening
-- Refs: TDD §3.14, §4.5, §6, §7, §8, FR-TSK-12, FR-TSK-13, FR-TSK-14, FR-TSK-15, FR-TSK-16

-- 1. Create task_application_status enum if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_application_status') THEN
        CREATE TYPE public.task_application_status AS ENUM ('pending', 'selected', 'withdrawn', 'rejected', 'expired');
    END IF;
END $$;

-- 2. Create task_applications table
CREATE TABLE IF NOT EXISTS public.task_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    helper_id uuid NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    status public.task_application_status NOT NULL DEFAULT 'pending',
    diajukan_at timestamptz NOT NULL DEFAULT NOW(),
    diputus_at timestamptz,
    CONSTRAINT task_applications_task_helper_unique UNIQUE (task_id, helper_id)
);

-- Partial index to ensure at most one selected application per task
CREATE UNIQUE INDEX IF NOT EXISTS task_applications_single_selected 
    ON public.task_applications (task_id) 
    WHERE (status = 'selected');

-- Enable RLS
ALTER TABLE public.task_applications ENABLE ROW LEVEL SECURITY;

-- Helper policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Helper can read own applications' AND tablename = 'task_applications') THEN
        CREATE POLICY "Helper can read own applications"
            ON public.task_applications
            FOR SELECT
            USING (
                helper_id IN (
                    SELECT id FROM public.helper_profiles WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Helper can insert own applications' AND tablename = 'task_applications') THEN
        CREATE POLICY "Helper can insert own applications"
            ON public.task_applications
            FOR INSERT
            WITH CHECK (
                helper_id IN (
                    SELECT id FROM public.helper_profiles WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Helper can update own applications' AND tablename = 'task_applications') THEN
        CREATE POLICY "Helper can update own applications"
            ON public.task_applications
            FOR UPDATE
            USING (
                helper_id IN (
                    SELECT id FROM public.helper_profiles WHERE user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Keluarga can read applications on own tasks' AND tablename = 'task_applications') THEN
        CREATE POLICY "Keluarga can read applications on own tasks"
            ON public.task_applications
            FOR SELECT
            USING (
                task_id IN (
                    SELECT id FROM public.tasks WHERE keluarga_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 3. RPC apply_to_task (Actor derived from auth.uid())
CREATE OR REPLACE FUNCTION public.apply_to_task(
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
    v_existing_app record;
    v_distance double precision;
    v_has_overlap boolean;
    v_app_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'code', 'unauthorized', 'message', 'Anda harus login');
    END IF;

    -- 1. Cari Helper
    SELECT id, user_id, status, is_available, tingkat_kepercayaan, domisili_lat, domisili_lng, radius_layanan_km
    INTO v_helper
    FROM public.helper_profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND OR v_helper.status != 'verified' THEN
        RETURN json_build_object('success', false, 'code', 'helper_not_verified', 'message', 'Helper belum diverifikasi atau sedang dinonaktifkan');
    END IF;

    IF NOT v_helper.is_available THEN
        RETURN json_build_object('success', false, 'code', 'helper_not_available', 'message', 'Status ketersediaan Helper sedang tidak aktif');
    END IF;

    -- 2. Kunci task
    SELECT id, status, mode_penugasan, service_category_id, lansia_id, jadwal_waktu, expires_at, keluarga_id
    INTO v_task
    FROM public.tasks
    WHERE id = p_task_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'code', 'task_not_found', 'message', 'Tugas tidak ditemukan');
    END IF;

    IF v_task.status != 'diajukan' THEN
        RETURN json_build_object('success', false, 'code', 'task_not_available', 'message', 'Tugas sudah tidak menerima pelamar');
    END IF;

    IF v_task.mode_penugasan != 'pelamar' THEN
        RETURN json_build_object('success', false, 'code', 'mode_not_allowed', 'message', 'Tugas ini bukan bertipe Pilih dari Pelamar');
    END IF;

    IF v_task.expires_at IS NOT NULL AND v_task.expires_at <= NOW() THEN
        RETURN json_build_object('success', false, 'code', 'task_expired', 'message', 'Batas waktu lamaran tugas telah kedaluwarsa');
    END IF;

    -- 3. Periksa apakah sudah pernah apply
    SELECT id, status INTO v_existing_app
    FROM public.task_applications
    WHERE task_id = p_task_id AND helper_id = v_helper.id;

    IF FOUND THEN
        IF v_existing_app.status = 'pending' THEN
            RETURN json_build_object('success', false, 'code', 'duplicate_application', 'message', 'Anda sudah mengajukan diri untuk tugas ini');
        ELSIF v_existing_app.status = 'withdrawn' THEN
            UPDATE public.task_applications
            SET status = 'pending', diajukan_at = NOW(), diputus_at = NULL
            WHERE id = v_existing_app.id;
            RETURN json_build_object('success', true, 'message', 'Pengajuan diri berhasil diajukan kembali', 'application_id', v_existing_app.id);
        ELSE
            RETURN json_build_object('success', false, 'code', 'application_decided', 'message', 'Pengajuan Anda sudah diputuskan');
        END IF;
    END IF;

    -- 4. Periksa kategori dilayani
    SELECT sc.id, sc.is_high_risk, sc.estimasi_durasi_menit
    INTO v_category
    FROM public.service_categories sc
    WHERE sc.id = v_task.service_category_id;

    IF v_helper.tingkat_kepercayaan = 'probation' AND v_category.is_high_risk THEN
        RETURN json_build_object('success', false, 'code', 'probation_high_risk', 'message', 'Helper probation belum diizinkan mengambil layanan berisiko tinggi');
    END IF;

    -- Periksa radius
    SELECT lat, lng INTO v_lansia
    FROM public.lansia_profiles
    WHERE id = v_task.lansia_id;

    IF v_lansia.lat IS NOT NULL AND v_lansia.lng IS NOT NULL AND v_helper.domisili_lat IS NOT NULL AND v_helper.domisili_lng IS NOT NULL THEN
        v_distance := public.haversine_distance_km(v_helper.domisili_lat, v_helper.domisili_lng, v_lansia.lat, v_lansia.lng);
        IF v_distance > COALESCE(v_helper.radius_layanan_km, 10) THEN
            RETURN json_build_object('success', false, 'code', 'outside_radius', 'message', 'Lokasi tugas berada di luar radius layanan Anda');
        END IF;
    END IF;

    -- 5. Periksa bentrok jadwal (tugas aktif yang overlap)
    SELECT EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.service_categories sc ON sc.id = t.service_category_id
        WHERE t.helper_id = v_helper.id
          AND t.status IN ('menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dikerjakan')
          AND (
            (t.jadwal_waktu, t.jadwal_waktu + (COALESCE(sc.estimasi_durasi_menit, 60) || ' minutes')::interval)
            OVERLAPS
            (v_task.jadwal_waktu, v_task.jadwal_waktu + (COALESCE(v_category.estimasi_durasi_menit, 60) || ' minutes')::interval)
          )
    ) INTO v_has_overlap;

    IF v_has_overlap THEN
        RETURN json_build_object('success', false, 'code', 'schedule_conflict', 'message', 'Jadwal tugas ini bentrok dengan tugas aktif Anda');
    END IF;

    -- 6. Insert application
    INSERT INTO public.task_applications (task_id, helper_id, status, diajukan_at)
    VALUES (p_task_id, v_helper.id, 'pending', NOW())
    RETURNING id INTO v_app_id;

    -- 7. Notifikasi ke Keluarga
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
        v_task.keluarga_id,
        'Pelamar Baru',
        'Seorang Helper telah mengajukan diri untuk mendampingi tugas Anda. Silakan tinjau pelamar.',
        'task'
    );

    RETURN json_build_object('success', true, 'message', 'Berhasil mengajukan diri untuk tugas ini', 'application_id', v_app_id);
END;
$$;

-- 4. RPC withdraw_task_application (Actor derived from auth.uid())
CREATE OR REPLACE FUNCTION public.withdraw_task_application(
    p_task_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_helper_id uuid;
    v_app record;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'code', 'unauthorized', 'message', 'Anda harus login');
    END IF;

    SELECT id INTO v_helper_id
    FROM public.helper_profiles
    WHERE user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'code', 'helper_not_found', 'message', 'Profil Helper tidak ditemukan');
    END IF;

    SELECT id, status INTO v_app
    FROM public.task_applications
    WHERE task_id = p_task_id AND helper_id = v_helper_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'code', 'application_not_found', 'message', 'Lamaran tidak ditemukan');
    END IF;

    IF v_app.status != 'pending' THEN
        RETURN json_build_object('success', false, 'code', 'application_not_pending', 'message', 'Hanya lamaran berstatus pending yang dapat dibatalkan');
    END IF;

    UPDATE public.task_applications
    SET status = 'withdrawn', diputus_at = NOW()
    WHERE id = v_app.id;

    RETURN json_build_object('success', true, 'message', 'Pengajuan diri berhasil dibatalkan');
END;
$$;

-- 5. RPC select_task_application (Atomic selection by Keluarga, auto-rejects others)
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
    v_app record;
    v_helper record;
    v_category record;
    v_next_status public.task_status;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'code', 'unauthorized', 'message', 'Anda harus login');
    END IF;

    -- 1. Kunci task & verifikasi Keluarga
    SELECT id, status, keluarga_id, helper_id, service_category_id
    INTO v_task
    FROM public.tasks
    WHERE id = p_task_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'code', 'task_not_found', 'message', 'Tugas tidak ditemukan');
    END IF;

    IF v_task.keluarga_id != v_user_id THEN
        RETURN json_build_object('success', false, 'code', 'forbidden', 'message', 'Anda bukan pemilik tugas ini');
    END IF;

    IF v_task.status != 'diajukan' OR v_task.helper_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'code', 'task_already_assigned', 'message', 'Tugas ini sudah terisi oleh Helper lain');
    END IF;

    -- 2. Kunci target application
    SELECT id, task_id, helper_id, status
    INTO v_app
    FROM public.task_applications
    WHERE id = p_application_id AND task_id = p_task_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'code', 'application_not_found', 'message', 'Lamaran tidak ditemukan');
    END IF;

    IF v_app.status != 'pending' THEN
        RETURN json_build_object('success', false, 'code', 'application_not_pending', 'message', 'Lamaran ini sudah tidak berstatus pending');
    END IF;

    -- 3. Kunci Helper & evaluasi next status (TDD §3.3.2)
    SELECT id, user_id, tingkat_kepercayaan, status, is_available
    INTO v_helper
    FROM public.helper_profiles
    WHERE id = v_app.helper_id
    FOR UPDATE;

    IF v_helper.status != 'verified' OR NOT v_helper.is_available THEN
        RETURN json_build_object('success', false, 'code', 'helper_no_longer_eligible', 'message', 'Helper sudah tidak aktif atau tidak tersedia');
    END IF;

    SELECT is_high_risk INTO v_category
    FROM public.service_categories
    WHERE id = v_task.service_category_id;

    IF v_helper.tingkat_kepercayaan = 'probation' OR v_category.is_high_risk THEN
        v_next_status := 'menunggu_persetujuan_koordinator'::public.task_status;
    ELSE
        v_next_status := 'dikonfirmasi'::public.task_status;
    END IF;

    -- 4. Update task
    UPDATE public.tasks
    SET helper_id = v_helper.id,
        status = v_next_status,
        confirmed_at = CASE WHEN v_next_status = 'dikonfirmasi'::public.task_status THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_task_id
      AND status = 'diajukan'
      AND helper_id IS NULL;

    -- 5. Update applications (target: selected, others: rejected)
    UPDATE public.task_applications
    SET status = CASE WHEN id = p_application_id THEN 'selected'::public.task_application_status ELSE 'rejected'::public.task_application_status END,
        diputus_at = NOW()
    WHERE task_id = p_task_id AND status = 'pending';

    -- 6. Notifikasi terpilih ke Helper
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
        v_helper.user_id,
        'Anda Dipilih!',
        'Keluarga telah memilih Anda untuk tugas pendampingan.',
        'task'
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Helper berhasil dipilih!',
        'task_id', p_task_id,
        'status', v_next_status::text,
        'helper_id', v_helper.id
    );
END;
$$;

-- 6. Hardened RPC accept_quick_task (Derived from auth.uid(), anti-race condition & schedule check)
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
    v_updated integer;
    v_has_overlap boolean;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'code', 'unauthorized', 'message', 'Anda harus login');
    END IF;

    -- 1. Find and lock helper
    SELECT id, user_id, status, is_available, tingkat_kepercayaan, domisili_lat, domisili_lng, radius_layanan_km
    INTO v_helper
    FROM public.helper_profiles
    WHERE user_id = v_user_id
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
    SELECT id, status, helper_id, mode_penugasan, service_category_id, jadwal_waktu, expires_at, keluarga_id
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

    -- 3. Periksa overlap jadwal & high risk
    SELECT sc.id, sc.is_high_risk, sc.estimasi_durasi_menit
    INTO v_category
    FROM public.service_categories sc
    WHERE sc.id = v_task.service_category_id;

    IF v_category.is_high_risk THEN
        RETURN json_build_object('success', false, 'code', 'high_risk_not_allowed', 'message', 'Kategori berisiko tinggi tidak diizinkan untuk Cari Cepat');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.service_categories sc ON sc.id = t.service_category_id
        WHERE t.helper_id = v_helper.id
          AND t.status IN ('menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dikerjakan')
          AND (
            (t.jadwal_waktu, t.jadwal_waktu + (COALESCE(sc.estimasi_durasi_menit, 60) || ' minutes')::interval)
            OVERLAPS
            (v_task.jadwal_waktu, v_task.jadwal_waktu + (COALESCE(v_category.estimasi_durasi_menit, 60) || ' minutes')::interval)
          )
    ) INTO v_has_overlap;

    IF v_has_overlap THEN
        RETURN json_build_object('success', false, 'code', 'schedule_conflict', 'message', 'Jadwal tugas ini bentrok dengan tugas aktif Anda');
    END IF;

    -- 4. Atomic conditional update
    UPDATE public.tasks
    SET helper_id = v_helper.id,
        status = 'dikonfirmasi'::public.task_status,
        confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_task_id
      AND status = 'diajukan'
      AND helper_id IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN json_build_object('success', false, 'code', 'race_condition_lost', 'message', 'Tugas sudah diambil oleh Helper lain');
    END IF;

    -- 5. Create notification for Keluarga
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

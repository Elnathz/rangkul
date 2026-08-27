-- ============================================================================
-- This is a disposable development/demo baseline. The linked Supabase project
-- is intentionally rebuilt from this file when migration history is repaired.
-- Auth accounts are preserved and mirrored into public.users below.
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;

-- ============================================================================
-- 1. ENUMS DEFINITION
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('keluarga', 'helper', 'koordinator', 'admin');
CREATE TYPE public.account_status AS ENUM ('active', 'restricted', 'suspended');
CREATE TYPE public.helper_status AS ENUM ('pending_verification', 'verified', 'under_review', 'rejected', 'suspended');
CREATE TYPE public.trust_tier AS ENUM ('probation', 'terpercaya');
CREATE TYPE public.koordinator_tingkat AS ENUM ('rt', 'rw');
CREATE TYPE public.koordinator_status AS ENUM ('pending_verification', 'verified', 'rejected', 'suspended');
CREATE TYPE public.task_status AS ENUM (
    'diajukan',
    'menunggu_persetujuan_koordinator',
    'dikonfirmasi',
    'dikerjakan',
    'menunggu_persetujuan_keluarga',
    'selesai',
    'dibatalkan'
);
CREATE TYPE public.payment_status AS ENUM ('pending', 'held_escrow', 'released', 'refunded', 'disputed', 'dibatalkan_kompensasi');
CREATE TYPE public.payment_method AS ENUM ('midtrans', 'saldo_demo');
CREATE TYPE public.transaction_event AS ENUM ('created', 'held', 'released', 'refunded', 'disputed');
CREATE TYPE public.notification_type AS ENUM ('task', 'payment', 'emergency', 'message', 'system', 'koordinator_info');
CREATE TYPE public.emergency_status AS ENUM ('active', 'acknowledged', 'resolved');
CREATE TYPE public.report_status AS ENUM ('menunggu', 'ditindak', 'selesai');
CREATE TYPE public.appeal_status AS ENUM ('menunggu', 'disetujui', 'ditolak');
CREATE TYPE public.extra_service_status AS ENUM ('menunggu_persetujuan_keluarga', 'disetujui', 'ditolak');

-- ============================================================================
-- 2. TABLES DEFINITION
-- ============================================================================

-- Table: users (Extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL,
    alamat_detail TEXT,
    rt INT,
    rw INT,
    kelurahan TEXT,
    kecamatan TEXT,
    kabupaten_kota TEXT,
    provinsi TEXT,
    role public.user_role NOT NULL DEFAULT 'keluarga',
    account_status public.account_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: lansia_profiles
CREATE TABLE public.lansia_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keluarga_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    alamat TEXT NOT NULL,
    lat NUMERIC,
    lng NUMERIC,
    catatan_kondisi TEXT,
    foto_url TEXT,
    hubungan_keluarga TEXT,
    dokumen_identitas_lansia_url TEXT,
    dokumen_hubungan_keluarga_url TEXT,
    provinsi TEXT,
    kabupaten_kota TEXT,
    kecamatan TEXT,
    kelurahan TEXT,
    rt INT,
    rw INT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: koordinator_profiles
CREATE TABLE public.koordinator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wilayah TEXT NOT NULL,
    tingkat public.koordinator_tingkat NOT NULL DEFAULT 'rt',
    dokumen_url TEXT,
    ktp_url TEXT,
    foto_url TEXT,
    domisili_lat NUMERIC,
    domisili_lng NUMERIC,
    status public.koordinator_status NOT NULL DEFAULT 'pending_verification',
    diverifikasi_oleh UUID REFERENCES public.users(id) ON DELETE SET NULL,
    diverifikasi_at TIMESTAMPTZ,
    saldo_komisi NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: helper_profiles
CREATE TABLE public.helper_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ktp_url TEXT,
    foto_wajah_url TEXT,
    bio TEXT,
    wilayah_domisili TEXT NOT NULL,
    domisili_lat NUMERIC,
    domisili_lng NUMERIC,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    radius_layanan_km NUMERIC NOT NULL DEFAULT 5,
    koordinator_id UUID REFERENCES public.koordinator_profiles(id) ON DELETE SET NULL,
    verified_by_admin_fallback BOOLEAN NOT NULL DEFAULT FALSE,
    status public.helper_status NOT NULL DEFAULT 'pending_verification',
    tingkat_kepercayaan public.trust_tier NOT NULL DEFAULT 'probation',
    tugas_selesai_berturut INT NOT NULL DEFAULT 0,
    suspend_reason TEXT,
    rating_avg NUMERIC NOT NULL DEFAULT 0,
    total_tugas_selesai INT NOT NULL DEFAULT 0,
    saldo_tersedia NUMERIC NOT NULL DEFAULT 0,
    promoted_at TIMESTAMPTZ,
    promoted_by UUID REFERENCES public.koordinator_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: service_categories
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    estimasi_durasi_menit INT NOT NULL,
    harga_dasar NUMERIC NOT NULL,
    is_high_risk BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tingkat TEXT NOT NULL DEFAULT 'ringan' CHECK (tingkat IN ('ringan', 'sedang', 'berat')),
    parent_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    jarak_min_km NUMERIC,
    jarak_max_km NUMERIC,
    CONSTRAINT service_categories_nama_parent_unique UNIQUE NULLS NOT DISTINCT (nama, parent_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keluarga_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    lansia_id UUID NOT NULL REFERENCES public.lansia_profiles(id) ON DELETE RESTRICT,
    helper_id UUID REFERENCES public.helper_profiles(id) ON DELETE RESTRICT,
    service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
    jadwal_waktu TIMESTAMPTZ NOT NULL,
    jadwal_waktu_asli TIMESTAMPTZ,
    reschedule_count INT NOT NULL DEFAULT 0,
    catatan TEXT,
    status public.task_status NOT NULL DEFAULT 'diajukan',
    harga_dasar NUMERIC NOT NULL,
    harga_final NUMERIC NOT NULL,
    checkin_time TIMESTAMPTZ,
    checkin_lat NUMERIC,
    checkin_lng NUMERIC,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: task_extra_services
CREATE TABLE public.task_extra_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    nama_layanan TEXT NOT NULL,
    biaya NUMERIC NOT NULL CHECK (biaya >= 1000),
    status public.extra_service_status NOT NULL DEFAULT 'menunggu_persetujuan_keluarga',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: task_evidence
CREATE TABLE public.task_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    foto_bukti_url TEXT NOT NULL,
    catatan_kondisi TEXT NOT NULL,
    client_submission_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: health_snapshots
CREATE TABLE public.health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    lansia_id UUID NOT NULL REFERENCES public.lansia_profiles(id) ON DELETE CASCADE,
    energi INT NOT NULL CHECK (energi BETWEEN 1 AND 5),
    mobilitas INT NOT NULL CHECK (mobilitas BETWEEN 1 AND 5),
    mood INT NOT NULL CHECK (mood BETWEEN 1 AND 5),
    nafsu_makan INT NOT NULL CHECK (nafsu_makan BETWEEN 1 AND 5),
    kualitas_tidur INT NOT NULL CHECK (kualitas_tidur BETWEEN 1 AND 5),
    cerita_hari_ini TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    jumlah_total NUMERIC NOT NULL,
    helper_share NUMERIC NOT NULL DEFAULT 0,
    platform_fee NUMERIC NOT NULL DEFAULT 0,
    koordinator_share NUMERIC NOT NULL DEFAULT 0,
    status public.payment_status NOT NULL DEFAULT 'pending',
    payment_method public.payment_method NOT NULL DEFAULT 'midtrans',
    midtrans_order_id TEXT,
    midtrans_snap_token TEXT,
    gateway_ref TEXT,
    held_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT payments_amount_nonnegative CHECK (amount >= 0),
    CONSTRAINT payments_jumlah_total_nonnegative CHECK (jumlah_total >= 0),
    CONSTRAINT payments_split_nonnegative CHECK (helper_share >= 0 AND platform_fee >= 0 AND koordinator_share >= 0)
);

-- Table: transaction_logs
CREATE TABLE public.transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    event_type public.transaction_event NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: ratings
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    keluarga_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    skor INT NOT NULL CHECK (skor BETWEEN 1 AND 5),
    komentar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Table: notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type public.notification_type NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: emergency_alerts
CREATE TABLE public.emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    triggered_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status public.emergency_status NOT NULL DEFAULT 'active',
    acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_helper_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    alasan TEXT NOT NULL,
    status public.report_status NOT NULL DEFAULT 'menunggu',
    ditindak_oleh UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: appeals
CREATE TABLE public.appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    alasan TEXT NOT NULL,
    status public.appeal_status NOT NULL DEFAULT 'menunggu',
    direview_oleh UUID REFERENCES public.users(id) ON DELETE SET NULL,
    direview_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: audit_logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: demo_wallets
CREATE TABLE public.demo_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    saldo NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.helper_service_categories (
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (helper_id, service_category_id)
);

CREATE TABLE public.promotion_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    koordinator_id UUID NOT NULL REFERENCES public.koordinator_profiles(id),
    identitas_valid BOOLEAN NOT NULL DEFAULT FALSE,
    dikenal_warga BOOLEAN NOT NULL DEFAULT FALSE,
    wawancara_dilakukan BOOLEAN NOT NULL DEFAULT FALSE,
    catatan_koordinator TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.helper_photo_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    foto_wajah_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    diajukan_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ditinjau_at TIMESTAMPTZ,
    ditinjau_oleh UUID REFERENCES public.users(id) ON DELETE SET NULL,
    alasan TEXT
);

CREATE UNIQUE INDEX payments_gateway_ref_unique
    ON public.payments (gateway_ref)
    WHERE gateway_ref IS NOT NULL;

CREATE UNIQUE INDEX idx_users_username_lower ON public.users (LOWER(username));

-- Katalog layanan tetap menjadi bagian dari schema baseline. Data transaksi demo
-- tidak masuk migration dan dijalankan oleh npm run seed.
DO $$
DECLARE
    parent_antar_obat UUID := gen_random_uuid();
    parent_bersih_bersih UUID := gen_random_uuid();
    parent_menemani UUID := gen_random_uuid();
    parent_teknologi UUID := gen_random_uuid();
    parent_belanja UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.service_categories
        (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat)
    VALUES
        (parent_antar_obat, 'Antar Obat', 'Mengambil dan mengantarkan obat ke rumah lansia.', 30, 35000, FALSE, FALSE, 'sedang'),
        (parent_bersih_bersih, 'Bersih-bersih', 'Membantu membersihkan rumah lansia.', 60, 50000, FALSE, FALSE, 'sedang'),
        (parent_menemani, 'Menemani Mengobrol', 'Mendampingi lansia mengobrol dan beraktivitas ringan.', 45, 40000, FALSE, FALSE, 'ringan'),
        (parent_teknologi, 'Bantuan Teknologi', 'Membantu lansia mengoperasikan perangkat digital.', 45, 30000, FALSE, FALSE, 'ringan'),
        (parent_belanja, 'Belanja Kebutuhan', 'Membantu membelikan kebutuhan harian lansia.', 60, 40000, FALSE, FALSE, 'sedang');

    INSERT INTO public.service_categories
        (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
    VALUES
        (gen_random_uuid(), 'Pengingat Obat', 'Kunjungan singkat untuk memandu lansia meminum obat tepat waktu.', 30, 25000, FALSE, TRUE, 'ringan', NULL, NULL, NULL),
        (gen_random_uuid(), 'Menemani Mengobrol (singkat)', 'Kunjungan singkat untuk mengecek keadaan umum lansia.', 30, 30000, FALSE, TRUE, 'ringan', parent_menemani, NULL, NULL),
        (gen_random_uuid(), 'Bantuan Teknologi (singkat)', 'Membantu video call dan penggunaan HP sederhana.', 30, 25000, FALSE, TRUE, 'ringan', parent_teknologi, NULL, NULL),
        (gen_random_uuid(), 'Bersih-bersih Ringan', 'Menyapu, mengepel satu ruangan, dan merapikan meja.', 30, 30000, FALSE, TRUE, 'ringan', parent_bersih_bersih, NULL, NULL),
        (gen_random_uuid(), 'Antar Obat (dekat, <=1 km)', 'Mengambil obat dari apotek atau warung terdekat.', 20, 25000, FALSE, TRUE, 'ringan', parent_antar_obat, NULL, 1),
        (gen_random_uuid(), 'Menemani Mengobrol (lama)', 'Menemani lebih lama dan berjalan di sekitar rumah.', 60, 50000, FALSE, TRUE, 'sedang', parent_menemani, NULL, NULL),
        (gen_random_uuid(), 'Bantuan Teknologi (lama)', 'Menyiapkan perangkat dan mengajarkan aplikasi.', 45, 40000, FALSE, TRUE, 'sedang', parent_teknologi, NULL, NULL),
        (gen_random_uuid(), 'Antar Obat (sedang, 1-3 km)', 'Mengantar obat dengan sepeda atau motor.', 45, 35000, FALSE, TRUE, 'sedang', parent_antar_obat, 1, 3),
        (gen_random_uuid(), 'Belanja Kebutuhan (standar)', 'Belanja harian ke warung atau minimarket.', 60, 40000, FALSE, TRUE, 'sedang', parent_belanja, NULL, NULL),
        (gen_random_uuid(), 'Antar Obat (jauh, >3 km)', 'Mengantar obat ke apotek atau fasilitas kesehatan yang jauh.', 90, 55000, FALSE, TRUE, 'berat', parent_antar_obat, 3, NULL),
        (gen_random_uuid(), 'Bersih-bersih Menyeluruh', 'Membersihkan beberapa ruangan, kamar mandi, dan dapur.', 90, 70000, FALSE, TRUE, 'berat', parent_bersih_bersih, NULL, NULL),
        (gen_random_uuid(), 'Kontrol Kesehatan (antar ke faskes)', 'Mendampingi lansia pergi dan pulang dari klinik atau rumah sakit.', 120, 120000, TRUE, TRUE, 'berat', NULL, NULL, NULL),
        (gen_random_uuid(), 'Belanja Kebutuhan (besar/jauh)', 'Belanja banyak item ke pasar atau supermarket jauh.', 90, 65000, FALSE, TRUE, 'berat', parent_belanja, NULL, NULL);
END;
$$;

-- ============================================================================
-- 3. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Trigger Function: Auto Sync Auth.users -> Public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, phone, full_name, role, username)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'keluarga'::public.user_role),
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'username', ''),
            'user_' || SUBSTR(NEW.email, 1, POSITION('@' IN NEW.email) - 1)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rebuild public.users for accounts that already existed in Auth before the
-- development baseline was applied.
INSERT INTO public.users (id, email, phone, full_name, role, username)
SELECT
    au.id,
    COALESCE(au.email, au.id::text || '@invalid.local'),
    au.phone,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    CASE au.raw_user_meta_data->>'role'
        WHEN 'helper' THEN 'helper'::public.user_role
        WHEN 'koordinator' THEN 'koordinator'::public.user_role
        WHEN 'admin' THEN 'admin'::public.user_role
        ELSE 'keluarga'::public.user_role
    END,
    COALESCE(
        NULLIF(au.raw_user_meta_data->>'username', ''),
        'user_' || REPLACE(au.id::text, '-', '')
    )
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Trigger Function: Accumulate Reports -> Auto Under Review
CREATE OR REPLACE FUNCTION public.handle_report_accumulation()
RETURNS TRIGGER AS $$
DECLARE
    active_report_count INT;
BEGIN
    SELECT COUNT(*) INTO active_report_count
    FROM public.reports
    WHERE reported_helper_id = NEW.reported_helper_id
      AND status = 'menunggu';

    IF active_report_count >= 2 THEN
        UPDATE public.helper_profiles
        SET status = 'under_review',
            updated_at = NOW()
        WHERE user_id = NEW.reported_helper_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_report_inserted
    AFTER INSERT ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_report_accumulation();

-- Trigger Function: Recalculate Rating Avg for Helper
CREATE OR REPLACE FUNCTION public.handle_rating_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.helper_profiles
    SET rating_avg = (
            SELECT COALESCE(AVG(skor), 0)
            FROM public.ratings
            WHERE helper_id = NEW.helper_id
        ),
        updated_at = NOW()
    WHERE id = NEW.helper_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_rating_inserted
    AFTER INSERT ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.handle_rating_update();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lansia_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koordinator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_extra_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_wallets ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Service categories are readable by everyone, editable by admin
CREATE POLICY "Public categories are readable" ON public.service_categories
    FOR SELECT USING (is_active = true);

-- Users can read their own user profile
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Lansia profiles can be read & managed by owning keluarga
CREATE POLICY "Keluarga can read own lansia" ON public.lansia_profiles
    FOR SELECT USING (auth.uid() = keluarga_id AND deleted_at IS NULL);

CREATE POLICY "Keluarga can insert own lansia" ON public.lansia_profiles
    FOR INSERT WITH CHECK (auth.uid() = keluarga_id);

CREATE POLICY "Keluarga can update own lansia" ON public.lansia_profiles
    FOR UPDATE USING (auth.uid() = keluarga_id);

-- Helper profiles readable by verified status or owner
CREATE POLICY "Verified helper profiles readable" ON public.helper_profiles
    FOR SELECT USING (status = 'verified' OR auth.uid() = user_id);

-- Notifications readable by owner
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Messages readable by sender or receiver
CREATE POLICY "Users can read own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============================================================================
-- 5. FINAL FUNCTIONS, POLICIES, STORAGE, AND RPCS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_koordinator_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('koordinator', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.prevent_sensitive_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.account_status IS DISTINCT FROM OLD.account_status
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Perubahan kolom sensitif tidak diizinkan';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_sensitive_user_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_user_update();

REVOKE UPDATE (role, account_status, email, id) ON public.users FROM authenticated;

CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Authenticated users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Helper can insert own profile" ON public.helper_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending_verification');

CREATE POLICY "Helper can update own profile" ON public.helper_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Helper can update own availability" ON public.helper_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Koordinator and admin can read helper profiles" ON public.helper_profiles
  FOR SELECT TO authenticated USING (public.is_koordinator_or_admin());

CREATE POLICY "Koordinator can read own profile" ON public.koordinator_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read verified koordinator profiles"
  ON public.koordinator_profiles
  FOR SELECT TO authenticated USING (status = 'verified');

CREATE POLICY "Koordinator can insert own profile" ON public.koordinator_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending_verification');

CREATE POLICY "Koordinator can update own profile" ON public.koordinator_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admin can read koordinator profiles" ON public.koordinator_profiles
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admin can update koordinator profiles" ON public.koordinator_profiles
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admin can read all lansia profiles" ON public.lansia_profiles
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admin can update lansia profiles" ON public.lansia_profiles
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admin can manage service categories" ON public.service_categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Helper can manage own service categories" ON public.helper_service_categories
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.helper_profiles
    WHERE id = helper_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.helper_profiles
    WHERE id = helper_id AND user_id = auth.uid()
  ));

CREATE POLICY "Koordinator and admin can read helper service categories"
  ON public.helper_service_categories
  FOR SELECT TO authenticated USING (public.is_koordinator_or_admin());

CREATE POLICY "Authenticated users can read helper service categories"
  ON public.helper_service_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Koordinator can manage promotion checklist"
  ON public.promotion_checklist
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.koordinator_profiles
    WHERE id = koordinator_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.koordinator_profiles
    WHERE id = koordinator_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all checklists"
  ON public.promotion_checklist
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Helper can create own photo request"
  ON public.helper_photo_change_requests FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.helper_profiles hp
    WHERE hp.id = helper_id AND hp.user_id = auth.uid()
  ));

CREATE POLICY "Helper can read own photo request"
  ON public.helper_photo_change_requests FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.helper_profiles hp
    WHERE hp.id = helper_id AND hp.user_id = auth.uid()
  ));

CREATE POLICY "Koordinator can read scoped photo request"
  ON public.helper_photo_change_requests FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.helper_profiles hp
    JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
    WHERE hp.id = helper_id AND kp.user_id = auth.uid() AND kp.status = 'verified'
  ));

CREATE POLICY "Admin can manage photo request"
  ON public.helper_photo_change_requests FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.helper_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_photo_change_requests ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen', 'dokumen', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload dokumen" ON storage.objects;
CREATE POLICY "Users can upload dokumen" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dokumen'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own dokumen" ON storage.objects;
CREATE POLICY "Users can read own dokumen" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'dokumen'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin can manage demo wallets" ON public.demo_wallets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can read own demo wallet" ON public.demo_wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read profiles of verified helpers" ON public.users
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.helper_profiles
    WHERE helper_profiles.user_id = public.users.id
      AND helper_profiles.status = 'verified'
  ));

-- Task marketplace and role-scoped task transitions.
CREATE POLICY "Keluarga can create own tasks" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = keluarga_id);

CREATE POLICY "Keluarga can read own tasks" ON public.tasks
  FOR SELECT TO authenticated USING (auth.uid() = keluarga_id);

CREATE POLICY "Keluarga can update own tasks" ON public.tasks
  FOR UPDATE TO authenticated USING (auth.uid() = keluarga_id);

CREATE POLICY "Verified helper can read task marketplace" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    (
      status = 'diajukan'
      AND helper_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.helper_profiles
        WHERE user_id = auth.uid() AND status = 'verified'
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.helper_profiles
      WHERE id = tasks.helper_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Verified helper can claim available tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'diajukan'
    AND EXISTS (
      SELECT 1 FROM public.helper_profiles
      WHERE user_id = auth.uid() AND status = 'verified'
    )
    AND (
      helper_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.helper_profiles
        WHERE id = tasks.helper_id AND user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.helper_profiles
      WHERE id = tasks.helper_id AND user_id = auth.uid() AND status = 'verified'
    )
    AND status IN ('dikonfirmasi', 'menunggu_persetujuan_koordinator')
  );

CREATE POLICY "Verified helper can start confirmed tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'dikonfirmasi'
    AND EXISTS (
      SELECT 1 FROM public.helper_profiles hp
      WHERE hp.id = tasks.helper_id AND hp.user_id = auth.uid() AND hp.status = 'verified'
    )
  )
  WITH CHECK (
    status = 'dikerjakan'
    AND EXISTS (
      SELECT 1 FROM public.helper_profiles hp
      WHERE hp.id = tasks.helper_id AND hp.user_id = auth.uid() AND hp.status = 'verified'
    )
  );

CREATE POLICY "Koordinator can read assigned helper tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.helper_profiles hp
    JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
    WHERE hp.id = tasks.helper_id AND kp.user_id = auth.uid() AND kp.status = 'verified'
  ));

CREATE POLICY "Koordinator can approve assigned tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'menunggu_persetujuan_koordinator'
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

CREATE POLICY "Helper can read related lansia task details" ON public.lansia_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks
    WHERE tasks.lansia_id = lansia_profiles.id
      AND (
        (
          tasks.status = 'diajukan'
          AND tasks.helper_id IS NULL
          AND EXISTS (
            SELECT 1 FROM public.helper_profiles
            WHERE user_id = auth.uid() AND status = 'verified'
          )
        )
        OR EXISTS (
          SELECT 1 FROM public.helper_profiles
          WHERE id = tasks.helper_id AND user_id = auth.uid()
        )
      )
  ));

CREATE POLICY "Koordinator can read assigned task lansia" ON public.lansia_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks task
    JOIN public.helper_profiles hp ON hp.id = task.helper_id
    JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
    WHERE task.lansia_id = lansia_profiles.id
      AND task.status = 'menunggu_persetujuan_koordinator'
      AND kp.user_id = auth.uid()
      AND kp.status = 'verified'
  ));

CREATE POLICY "Keluarga can insert extra services" ON public.task_extra_services
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_id AND tasks.keluarga_id = auth.uid()
  ));

CREATE POLICY "Keluarga can select extra services" ON public.task_extra_services
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_id AND tasks.keluarga_id = auth.uid()
  ));

CREATE POLICY "Task participants can read extra services" ON public.task_extra_services
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = task_extra_services.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  ));

CREATE POLICY "Task participants can read task evidence" ON public.task_evidence
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = task_evidence.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  ));

CREATE POLICY "Task participants can read health snapshots" ON public.health_snapshots
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = health_snapshots.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  ));

CREATE OR REPLACE FUNCTION public.notify_helper_of_direct_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  helper_user_id UUID;
  service_name TEXT;
  lansia_name TEXT;
BEGIN
  IF NEW.helper_id IS NULL THEN RETURN NEW; END IF;

  SELECT user_id INTO helper_user_id FROM public.helper_profiles WHERE id = NEW.helper_id;
  IF helper_user_id IS NULL THEN RETURN NEW; END IF;

  SELECT nama INTO service_name FROM public.service_categories WHERE id = NEW.service_category_id;
  SELECT nama INTO lansia_name FROM public.lansia_profiles WHERE id = NEW.lansia_id;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (
    helper_user_id,
    'Booking baru menunggu konfirmasi',
    format(
      '%s untuk %s dijadwalkan %s. Buka Papan Tugas untuk menerima atau menolak tugas ini.',
      COALESCE(service_name, 'Tugas baru'),
      COALESCE(lansia_name, 'profil lansia'),
      to_char(NEW.jadwal_waktu AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY, HH24:MI')
    ),
    'task'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_direct_booking_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW WHEN (NEW.helper_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_helper_of_direct_booking();

CREATE OR REPLACE FUNCTION public.notify_family_of_task_evidence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_keluarga_id UUID;
BEGIN
  SELECT keluarga_id INTO v_keluarga_id FROM public.tasks WHERE id = NEW.task_id;
  IF v_keluarga_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
      v_keluarga_id,
      'Laporan kunjungan tersedia',
      'Helper sudah mengirim foto, catatan kondisi, dan Health Snapshot untuk kunjunganmu.',
      'task'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_evidence_inserted
  AFTER INSERT ON public.task_evidence
  FOR EACH ROW EXECUTE FUNCTION public.notify_family_of_task_evidence();

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
    RAISE EXCEPTION 'Anda harus login untuk mengajukan layanan tambahan' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(p_nama_layanan), '') IS NULL THEN
    RAISE EXCEPTION 'Nama layanan tambahan wajib diisi' USING ERRCODE = '22023';
  END IF;
  IF p_biaya IS NULL OR p_biaya < 1000 THEN
    RAISE EXCEPTION 'Biaya layanan tambahan minimal Rp1.000' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.tasks t
  JOIN public.helper_profiles hp ON hp.id = t.helper_id
  WHERE t.id = p_task_id AND hp.user_id = auth.uid() AND t.status = 'dikerjakan'
  FOR UPDATE OF t;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak sedang dikerjakan oleh Helper ini' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.task_extra_services (task_id, nama_layanan, biaya)
  VALUES (p_task_id, BTRIM(p_nama_layanan), p_biaya)
  RETURNING * INTO v_service;

  UPDATE public.tasks
  SET status = 'menunggu_persetujuan_keluarga', updated_at = NOW()
  WHERE id = p_task_id AND status = 'dikerjakan';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status tugas sudah berubah' USING ERRCODE = 'P0001';
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
    RAISE EXCEPTION 'Anda harus login untuk memutuskan layanan tambahan' USING ERRCODE = '42501';
  END IF;
  IF p_decision NOT IN ('disetujui', 'ditolak') THEN
    RAISE EXCEPTION 'Keputusan layanan tambahan tidak valid' USING ERRCODE = '22023';
  END IF;

  SELECT t.* INTO v_task
  FROM public.tasks t
  JOIN public.task_extra_services es ON es.task_id = t.id
  WHERE t.id = p_task_id
    AND es.id = p_extra_service_id
    AND t.keluarga_id = auth.uid()
    AND t.status = 'menunggu_persetujuan_keluarga'
    AND es.status = 'menunggu_persetujuan_keluarga'
  FOR UPDATE OF t;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan layanan tambahan sudah diproses atau tidak dapat diakses' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.task_extra_services
  SET status = p_decision::public.extra_service_status
  WHERE id = p_extra_service_id AND task_id = p_task_id
    AND status = 'menunggu_persetujuan_keluarga';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan layanan tambahan baru saja diproses' USING ERRCODE = 'P0001';
  END IF;

  IF p_decision = 'disetujui' THEN
    SELECT COALESCE(SUM(biaya) FILTER (WHERE status = 'disetujui'), 0)
    INTO v_approved_total
    FROM public.task_extra_services WHERE task_id = p_task_id;

    UPDATE public.tasks
    SET harga_final = harga_dasar + v_approved_total, status = 'dikerjakan', updated_at = NOW()
    WHERE id = p_task_id;
  ELSE
    UPDATE public.tasks SET status = 'dikerjakan', updated_at = NOW() WHERE id = p_task_id;
  END IF;

  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  RETURN v_task;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_task_evidence(
  p_task_id UUID,
  p_foto_bukti_url TEXT,
  p_catatan_kondisi TEXT,
  p_energi INT,
  p_mobilitas INT,
  p_mood INT,
  p_nafsu_makan INT,
  p_kualitas_tidur INT,
  p_cerita_hari_ini TEXT,
  p_client_submission_id TEXT
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk mengirim laporan' USING ERRCODE = '42501';
  END IF;

  SELECT t.* INTO v_task
  FROM public.tasks t
  JOIN public.helper_profiles hp ON hp.id = t.helper_id
  JOIN public.task_evidence existing ON existing.task_id = t.id
  WHERE t.id = p_task_id AND hp.user_id = auth.uid()
    AND existing.client_submission_id = p_client_submission_id;
  IF FOUND THEN RETURN v_task; END IF;

  SELECT t.* INTO v_task
  FROM public.tasks t
  JOIN public.helper_profiles hp ON hp.id = t.helper_id
  WHERE t.id = p_task_id AND hp.user_id = auth.uid() AND t.status = 'dikerjakan'
  FOR UPDATE OF t;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak sedang dikerjakan oleh Helper ini' USING ERRCODE = 'P0001';
  END IF;
  IF p_foto_bukti_url IS NULL OR NULLIF(BTRIM(p_foto_bukti_url), '') IS NULL THEN
    RAISE EXCEPTION 'Foto bukti wajib diunggah' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.task_evidence (task_id, foto_bukti_url, catatan_kondisi, client_submission_id)
  VALUES (p_task_id, BTRIM(p_foto_bukti_url), BTRIM(p_catatan_kondisi), p_client_submission_id);

  INSERT INTO public.health_snapshots (
    task_id, lansia_id, energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini
  )
  VALUES (
    p_task_id, v_task.lansia_id, p_energi, p_mobilitas, p_mood, p_nafsu_makan,
    p_kualitas_tidur, NULLIF(BTRIM(p_cerita_hari_ini), '')
  );

  UPDATE public.tasks
  SET status = 'selesai', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_task_id AND status = 'dikerjakan'
  RETURNING * INTO v_task;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status tugas sudah berubah' USING ERRCODE = 'P0001';
  END IF;
  RETURN v_task;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Laporan tugas sudah dikirim' USING ERRCODE = '23505';
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_task_completion(p_task_id UUID)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk mengonfirmasi tugas' USING ERRCODE = '42501';
  END IF;
  UPDATE public.tasks
  SET updated_at = NOW()
  WHERE id = p_task_id AND keluarga_id = auth.uid() AND status = 'selesai'
    AND EXISTS (SELECT 1 FROM public.task_evidence e WHERE e.task_id = tasks.id)
  RETURNING * INTO v_task;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas belum siap dikonfirmasi atau bukan milik keluarga ini' USING ERRCODE = 'P0001';
  END IF;
  RETURN v_task;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_task(p_task_id UUID, p_cancellation_reason TEXT)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk membatalkan tugas' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(p_cancellation_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Alasan pembatalan wajib diisi' USING ERRCODE = '22023';
  END IF;
  UPDATE public.tasks
  SET status = 'dibatalkan', cancellation_reason = BTRIM(p_cancellation_reason),
      cancelled_at = NOW(), updated_at = NOW()
  WHERE id = p_task_id AND keluarga_id = auth.uid()
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
  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid() FOR UPDATE;
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
      jadwal_waktu = p_jadwal_waktu, reschedule_count = reschedule_count + 1, updated_at = NOW()
  WHERE id = p_task_id RETURNING * INTO v_task;
  RETURN v_task;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_pending_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE expired_count INTEGER;
BEGIN
  UPDATE public.tasks
  SET status = 'dibatalkan', cancelled_at = COALESCE(cancelled_at, NOW()),
      cancellation_reason = COALESCE(cancellation_reason, 'Tugas otomatis dibatalkan karena tidak diterima dalam 1 jam.'),
      updated_at = NOW()
  WHERE status = 'diajukan' AND expires_at IS NOT NULL AND expires_at <= NOW();
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_midtrans_payment(
  p_task_id UUID,
  p_order_id TEXT,
  p_snap_token TEXT,
  p_amount NUMERIC
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_payment public.payments;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid()
    AND status IN ('dikonfirmasi', 'dikerjakan', 'selesai') FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibayar oleh akun ini' USING ERRCODE = 'P0001';
  END IF;
  IF p_amount <> v_task.harga_final THEN
    RAISE EXCEPTION 'Nominal pembayaran tidak sama dengan harga final tugas' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF FOUND AND v_payment.status IN ('held_escrow', 'released', 'dibatalkan_kompensasi') THEN
    RAISE EXCEPTION 'Pembayaran tugas sudah diproses' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.payments (
    task_id, amount, jumlah_total, payment_method, status,
    midtrans_order_id, midtrans_snap_token, updated_at
  )
  VALUES (
    p_task_id, p_amount, p_amount, 'midtrans', 'pending',
    p_order_id, p_snap_token, NOW()
  )
  ON CONFLICT (task_id) DO UPDATE SET
    amount = EXCLUDED.amount,
    jumlah_total = EXCLUDED.jumlah_total,
    payment_method = EXCLUDED.payment_method,
    status = CASE
      WHEN public.payments.status = 'refunded' THEN 'pending'::public.payment_status
      ELSE public.payments.status
    END,
    midtrans_order_id = EXCLUDED.midtrans_order_id,
    midtrans_snap_token = EXCLUDED.midtrans_snap_token,
    updated_at = NOW()
  RETURNING * INTO v_payment;

  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'created', jsonb_build_object(
    'provider', 'midtrans', 'order_id', p_order_id, 'amount', p_amount
  ));
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.settle_midtrans_payment(
  p_order_id TEXT,
  p_gateway_ref TEXT,
  p_payload JSONB
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments;
  v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Webhook tidak terautentikasi' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_payment FROM public.payments
  WHERE midtrans_order_id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order Midtrans tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_payment.status IN ('held_escrow', 'released') THEN RETURN v_payment; END IF;

  SELECT * INTO v_task FROM public.tasks WHERE id = v_payment.task_id;
  UPDATE public.payments
  SET status = 'held_escrow', gateway_ref = p_gateway_ref,
      held_at = COALESCE(held_at, NOW()), updated_at = NOW()
  WHERE id = v_payment.id RETURNING * INTO v_payment;

  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'held', COALESCE(p_payload, '{}'::JSONB));
  IF v_task.keluarga_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (v_task.keluarga_id, 'Pembayaran diterima', 'Pembayaran tugas sudah dikonfirmasi oleh Midtrans Sandbox.', 'payment');
  END IF;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_task_payment(p_task_id UUID)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_payment public.payments;
  v_helper public.helper_profiles;
  v_koordinator public.koordinator_profiles;
  v_helper_share NUMERIC;
  v_platform_fee NUMERIC;
  v_koordinator_share NUMERIC;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid() AND status = 'selesai' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas belum selesai atau bukan milik Keluarga ini' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF NOT FOUND OR v_payment.status <> 'held_escrow' THEN
    RAISE EXCEPTION 'Pembayaran belum berstatus held_escrow' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_helper FROM public.helper_profiles WHERE id = v_task.helper_id FOR UPDATE;
  IF v_helper.id IS NOT NULL THEN
    SELECT * INTO v_koordinator FROM public.koordinator_profiles WHERE id = v_helper.koordinator_id FOR UPDATE;
  END IF;

  v_helper_share := ROUND(v_payment.jumlah_total * 0.90, 0);
  v_platform_fee := ROUND(v_payment.jumlah_total * 0.07, 0);
  v_koordinator_share := v_payment.jumlah_total - v_helper_share - v_platform_fee;

  UPDATE public.payments
  SET status = 'released', helper_share = v_helper_share, platform_fee = v_platform_fee,
      koordinator_share = v_koordinator_share, released_at = NOW(), updated_at = NOW()
  WHERE id = v_payment.id RETURNING * INTO v_payment;

  IF v_helper.id IS NOT NULL THEN
    UPDATE public.helper_profiles
    SET saldo_tersedia = saldo_tersedia + v_helper_share, updated_at = NOW()
    WHERE id = v_helper.id;
  END IF;
  IF v_koordinator.id IS NOT NULL THEN
    UPDATE public.koordinator_profiles
    SET saldo_komisi = saldo_komisi + v_koordinator_share, updated_at = NOW()
    WHERE id = v_koordinator.id;
  END IF;

  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'released', jsonb_build_object(
    'helper_share', v_helper_share, 'platform_fee', v_platform_fee,
    'koordinator_share', v_koordinator_share
  ));
  IF v_helper.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (v_helper.user_id, 'Pembayaran dicairkan', 'Pembayaran tugas sudah dicatat sebagai pencairan.', 'payment');
  END IF;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_midtrans_payment(
  p_task_id UUID,
  p_gateway_ref TEXT,
  p_payload JSONB
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_payment public.payments;
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Request refund tidak terautentikasi' USING ERRCODE = '42501';
  END IF;
  SELECT p.* INTO v_payment
  FROM public.payments p
  JOIN public.tasks t ON t.id = p.task_id
  WHERE p.task_id = p_task_id
    AND (t.keluarga_id = auth.uid() OR auth.role() = 'service_role') FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pembayaran tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_payment.status = 'refunded' THEN RETURN v_payment; END IF;
  IF v_payment.status <> 'held_escrow' THEN
    RAISE EXCEPTION 'Pembayaran belum dapat direfund' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.payments
  SET status = 'refunded', gateway_ref = COALESCE(p_gateway_ref, gateway_ref), updated_at = NOW()
  WHERE id = v_payment.id RETURNING * INTO v_payment;
  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'refunded', COALESCE(p_payload, '{}'::JSONB));
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_task_with_compensation(
  p_task_id UUID,
  p_cancellation_reason TEXT,
  p_refund_payload JSONB
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_payment public.payments;
  v_helper public.helper_profiles;
  v_compensation NUMERIC;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid() AND status = 'dikonfirmasi' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibatalkan pada status ini' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF NOT FOUND OR v_payment.status <> 'held_escrow' THEN
    RAISE EXCEPTION 'Pembayaran belum held untuk kompensasi pembatalan' USING ERRCODE = 'P0001';
  END IF;

  v_compensation := ROUND(v_payment.jumlah_total * 0.50, 0);
  UPDATE public.tasks
  SET status = 'dibatalkan', cancellation_reason = BTRIM(p_cancellation_reason),
      cancelled_at = NOW(), updated_at = NOW()
  WHERE id = p_task_id RETURNING * INTO v_task;
  UPDATE public.payments
  SET status = 'dibatalkan_kompensasi', helper_share = v_compensation,
      platform_fee = 0, koordinator_share = 0, updated_at = NOW()
  WHERE id = v_payment.id;

  SELECT * INTO v_helper FROM public.helper_profiles WHERE id = v_task.helper_id FOR UPDATE;
  IF v_helper.id IS NOT NULL THEN
    UPDATE public.helper_profiles
    SET saldo_tersedia = saldo_tersedia + v_compensation, updated_at = NOW()
    WHERE id = v_helper.id;
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (v_helper.user_id, 'Kompensasi pembatalan', 'Kompensasi 50% dari tugas yang dibatalkan sudah dicatat.', 'payment');
  END IF;
  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'refunded', jsonb_build_object(
    'compensation', v_compensation,
    'family_refund', v_payment.jumlah_total - v_compensation,
    'reason', p_refund_payload
  ));
  RETURN v_task;
END;
$$;

CREATE POLICY "Payment participants can read payments" ON public.payments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = payments.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  ));

CREATE POLICY "Payment participants can read transaction logs" ON public.transaction_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.payments p
    JOIN public.tasks t ON t.id = p.task_id
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE p.id = transaction_logs.payment_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  ));

REVOKE INSERT, UPDATE, DELETE ON public.payments FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.transaction_logs FROM authenticated;

CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND task_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = messages.task_id
        AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
        AND receiver_id IN (t.keluarga_id, hp.user_id)
    )
  );

CREATE POLICY "Message receivers can mark read" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Families can submit reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reporter_id
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'keluarga')
  );

CREATE POLICY "Report owners can read own reports" ON public.reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

CREATE POLICY "Scoped reviewers can read reports" ON public.reports
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
      JOIN public.users reviewer ON reviewer.id = auth.uid()
      WHERE hp.user_id = reports.reported_helper_id
        AND reviewer.role = 'koordinator'
        AND kp.user_id = reviewer.id
    )
  );

CREATE POLICY "Scoped reviewers can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
      WHERE hp.user_id = reports.reported_helper_id AND kp.user_id = auth.uid()
    )
  )
  WITH CHECK (ditindak_oleh = auth.uid() OR public.is_admin());

CREATE POLICY "Task participants can read emergency alerts" ON public.emergency_alerts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    LEFT JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
    WHERE t.id = emergency_alerts.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid() OR kp.user_id = auth.uid() OR public.is_admin())
  ));

CREATE POLICY "Assigned helpers can trigger emergency alerts" ON public.emergency_alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = triggered_by
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = emergency_alerts.task_id AND hp.user_id = auth.uid() AND t.status = 'dikerjakan'
    )
  );

CREATE POLICY "Emergency contacts can acknowledge alerts" ON public.emergency_alerts
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    LEFT JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
    WHERE t.id = emergency_alerts.task_id
      AND (t.keluarga_id = auth.uid() OR kp.user_id = auth.uid() OR public.is_admin())
  ))
  WITH CHECK (acknowledged_by = auth.uid() OR public.is_admin());

GRANT EXECUTE ON FUNCTION public.create_extra_service(UUID, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_extra_service(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_task_evidence(UUID, TEXT, TEXT, INT, INT, INT, INT, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_task_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_task(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_task(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pending_tasks() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_midtrans_payment(UUID, TEXT, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_midtrans_payment(TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_task_payment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_midtrans_payment(UUID, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_task_with_compensation(UUID, TEXT, JSONB) TO authenticated;

GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT UPDATE (read_at) ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.emergency_alerts TO authenticated;

-- Supabase service_role bypasses RLS, but it still needs table privileges.
-- The baseline recreates public, so restore these grants explicitly.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO service_role;

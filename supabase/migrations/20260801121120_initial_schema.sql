-- ============================================================================
-- 1. ENUMS DEFINITION
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('keluarga', 'helper', 'koordinator', 'admin');
CREATE TYPE public.account_status AS ENUM ('active', 'restricted', 'suspended');
CREATE TYPE public.helper_status AS ENUM ('pending_verification', 'verified', 'under_review', 'suspended');
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
CREATE TYPE public.payment_status AS ENUM ('pending', 'held_escrow', 'released', 'refunded', 'dibatalkan_kompensasi');
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
    dokumen_identitas_lansia_url TEXT,
    dokumen_hubungan_keluarga_url TEXT,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: service_categories
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT UNIQUE NOT NULL,
    deskripsi TEXT NOT NULL,
    estimasi_durasi_menit INT NOT NULL,
    harga_dasar NUMERIC NOT NULL,
    is_high_risk BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
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
    biaya NUMERIC NOT NULL,
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
    status public.payment_status NOT NULL DEFAULT 'pending',
    payment_method public.payment_method NOT NULL DEFAULT 'midtrans',
    midtrans_order_id TEXT,
    midtrans_snap_token TEXT,
    held_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- ============================================================================
-- 3. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Trigger Function: Auto Sync Auth.users -> Public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, phone, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'keluarga'::public.user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

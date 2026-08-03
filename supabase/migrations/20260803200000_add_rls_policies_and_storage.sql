-- =============================================================
-- Sprint 1: RLS policies tambahan + storage bucket dokumen
-- =============================================================

-- ---------- Helper functions cek role (SECURITY DEFINER mencegah rekursi RLS) ----------
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

-- ---------- USERS ----------
-- Admin dapat membaca semua profil
CREATE POLICY "Admin can read all users" ON public.users
    FOR SELECT USING (public.is_admin());

-- User dapat mengupdate profilnya sendiri
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------- HELPER PROFILES ----------
-- Helper membuat profil sendiri
CREATE POLICY "Helper can insert own profile" ON public.helper_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helper mengupdate profil sendiri
CREATE POLICY "Helper can update own profile" ON public.helper_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Koordinator & admin dapat membaca semua profil helper (untuk verifikasi)
CREATE POLICY "Koordinator and admin can read helper profiles" ON public.helper_profiles
    FOR SELECT USING (public.is_koordinator_or_admin());

-- ---------- KOORDINATOR PROFILES ----------
CREATE POLICY "Koordinator can read own profile" ON public.koordinator_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Koordinator can insert own profile" ON public.koordinator_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Koordinator can update own profile" ON public.koordinator_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin dapat membaca & mengupdate profil koordinator (verifikasi)
CREATE POLICY "Admin can read koordinator profiles" ON public.koordinator_profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can update koordinator profiles" ON public.koordinator_profiles
    FOR UPDATE USING (public.is_admin());

-- ---------- STORAGE BUCKET ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen', 'dokumen', false)
ON CONFLICT (id) DO NOTHING;

-- User dapat upload file ke folder miliknya ({userId}/)
CREATE POLICY "Users can upload dokumen" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'dokumen'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- User dapat membaca (untuk signed URL) file di folder miliknya
CREATE POLICY "Users can read own dokumen" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dokumen'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

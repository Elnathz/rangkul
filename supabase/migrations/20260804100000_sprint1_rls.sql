-- =============================================================
-- Sprint 1: RLS tambahan — Admin read all lansia, service categories admin
-- =============================================================

-- Admin dapat membaca semua profil lansia (untuk moderasi)
CREATE POLICY "Admin can read all lansia profiles" ON public.lansia_profiles
    FOR SELECT USING (public.is_admin());

-- Admin dapat mengupdate profil lansia (untuk moderasi darurat)
CREATE POLICY "Admin can update lansia profiles" ON public.lansia_profiles
    FOR UPDATE USING (public.is_admin());

-- Admin dapat mengelola service categories
CREATE POLICY "Admin can manage service categories" ON public.service_categories
    FOR ALL USING (public.is_admin());

-- Authenticated user dapat membaca service categories aktif
-- (sudah ada policy "Public categories are readable" tapi hanya SELECT is_active=true)
-- Policy ini sudah cukup dari initial schema, tidak perlu ditambah

-- Helper dapat mengupdate availability-nya sendiri
CREATE POLICY "Helper can update own availability" ON public.helper_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Demo wallets: user hanya bisa lihat saldo sendiri
CREATE POLICY "Users can read own demo wallet" ON public.demo_wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Admin dapat top-up demo wallets
CREATE POLICY "Admin can manage demo wallets" ON public.demo_wallets
    FOR ALL USING (public.is_admin());

-- =============================================================================
-- Sprint 1: Tabel relasi helper dengan kategori layanan
-- =============================================================================

-- Tabel junction helper_service_categories (many-to-many)
-- Helper bisa punya banyak kategori layanan, kategori bisa dilayani banyak helper
CREATE TABLE public.helper_service_categories (
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (helper_id, service_category_id)
);

ALTER TABLE public.helper_service_categories ENABLE ROW LEVEL SECURITY;

-- Helper bisa kelola kategori layanannya sendiri
CREATE POLICY "Helper can manage own service categories" ON public.helper_service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.helper_profiles
            WHERE id = helper_id AND user_id = auth.uid()
        )
    );

-- Koordinator dan admin bisa baca semua (untuk tampilan antrean verifikasi)
CREATE POLICY "Koordinator and admin can read helper service categories" ON public.helper_service_categories
    FOR SELECT USING (public.is_koordinator_or_admin());

-- Semua authenticated user bisa baca (untuk katalog dan filter)
CREATE POLICY "Authenticated users can read helper service categories" ON public.helper_service_categories
    FOR SELECT TO authenticated
    USING (true);

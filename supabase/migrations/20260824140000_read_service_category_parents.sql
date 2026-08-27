-- Parent kategori bukan layanan yang dapat dipilih, tetapi namanya dibutuhkan
-- untuk membentuk hierarki katalog pada picker Helper.
DROP POLICY IF EXISTS "Public categories are readable" ON public.service_categories;

CREATE POLICY "Public categories are readable" ON public.service_categories
    FOR SELECT USING (is_active = true OR parent_id IS NULL);

-- =============================================================
-- Tingkatan Jasa & Probation Revision
-- =============================================================

-- 1. ALTER tabel service_categories
ALTER TABLE public.service_categories
    ADD COLUMN tingkat TEXT NOT NULL DEFAULT 'ringan'
        CHECK (tingkat IN ('ringan', 'sedang', 'berat')),
    ADD COLUMN parent_id UUID REFERENCES public.service_categories(id) DEFAULT NULL,
    ADD COLUMN jarak_min_km NUMERIC DEFAULT NULL,
    ADD COLUMN jarak_max_km NUMERIC DEFAULT NULL;

-- Hapus constraint UNIQUE lama pada nama (karena sub-kategori bisa punya nama mirip)
ALTER TABLE public.service_categories DROP CONSTRAINT IF EXISTS service_categories_nama_key;

-- Tambah constraint UNIQUE baru pada (nama, parent_id) untuk mencegah duplikasi
-- dalam satu parent yang sama
-- NULL tidak dihitung unik di Postgres, jadi kita biarkan (kalau mau ketat bisa tambah logic lain, tapi ini cukup)
ALTER TABLE public.service_categories
    ADD CONSTRAINT service_categories_nama_parent_unique UNIQUE NULLS NOT DISTINCT (nama, parent_id);

-- 2. ALTER tabel helper_profiles
ALTER TABLE public.helper_profiles
    ADD COLUMN promoted_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN promoted_by UUID REFERENCES public.koordinator_profiles(id) DEFAULT NULL;

-- 3. CREATE tabel promotion_checklist
CREATE TABLE public.promotion_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    koordinator_id UUID NOT NULL REFERENCES public.koordinator_profiles(id),
    
    -- Checklist items
    identitas_valid BOOLEAN NOT NULL DEFAULT FALSE,
    dikenal_warga BOOLEAN NOT NULL DEFAULT FALSE,
    wawancara_dilakukan BOOLEAN NOT NULL DEFAULT FALSE,
    catatan_koordinator TEXT,
    
    -- Metadata
    completed_at TIMESTAMPTZ DEFAULT NULL, -- NULL = belum selesai
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.promotion_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Koordinator can manage promotion checklist"
    ON public.promotion_checklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.koordinator_profiles
            WHERE id = koordinator_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage all checklists"
    ON public.promotion_checklist
    FOR ALL USING (public.is_admin());

-- 4. Seed Data Baru (13 Sub-kategori)
-- Hapus data lama yang bereferensi
DELETE FROM public.helper_service_categories;
DELETE FROM public.service_categories;

-- Insert parent categories (is_active = false, tidak bisa dibooking langsung)
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat)
VALUES
    ('a0000001-0000-0000-0000-000000000001', 'Antar Obat', 'Mengambil dan mengantarkan obat ke rumah lansia', 30, 35000, FALSE, FALSE, 'sedang'),
    ('a0000002-0000-0000-0000-000000000002', 'Bersih-bersih', 'Membantu membersihkan rumah lansia', 60, 50000, FALSE, FALSE, 'sedang'),
    ('a0000003-0000-0000-0000-000000000003', 'Menemani Mengobrol', 'Mendampingi lansia mengobrol dan beraktivitas ringan', 45, 40000, FALSE, FALSE, 'ringan'),
    ('a0000004-0000-0000-0000-000000000004', 'Bantuan Teknologi', 'Membantu lansia mengoperasikan perangkat digital', 45, 30000, FALSE, FALSE, 'ringan'),
    ('a0000005-0000-0000-0000-000000000005', 'Belanja Kebutuhan', 'Membantu membelikan kebutuhan harian lansia', 60, 40000, FALSE, FALSE, 'sedang');

-- Insert leaf categories RINGAN
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'Pengingat Obat', 'Kunjungan singkat untuk memandu dan memastikan lansia meminum obat tepat dosis & waktu.', 30, 25000, FALSE, TRUE, 'ringan', NULL, NULL, NULL),
    ('b0000002-0000-0000-0000-000000000002', 'Menemani Mengobrol (singkat)', 'Kunjungan singkat, ngobrol, cek keadaan umum lansia.', 30, 30000, FALSE, TRUE, 'ringan', 'a0000003-0000-0000-0000-000000000003', NULL, NULL),
    ('b0000003-0000-0000-0000-000000000003', 'Bantuan Teknologi (singkat)', 'Bantu video call keluarga, operasikan HP sederhana.', 30, 25000, FALSE, TRUE, 'ringan', 'a0000004-0000-0000-0000-000000000004', NULL, NULL),
    ('b0000004-0000-0000-0000-000000000004', 'Bersih-bersih Ringan', 'Sapu-pel 1 ruangan, cuci piring, rapikan meja.', 30, 30000, FALSE, TRUE, 'ringan', 'a0000002-0000-0000-0000-000000000002', NULL, NULL),
    ('b0000005-0000-0000-0000-000000000005', 'Antar Obat (dekat, <=1 km)', 'Ambil obat di apotek/warung dekat, jalan kaki.', 20, 25000, FALSE, TRUE, 'ringan', 'a0000001-0000-0000-0000-000000000001', NULL, 1);

-- Insert leaf categories SEDANG
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
VALUES
    ('b0000006-0000-0000-0000-000000000006', 'Menemani Mengobrol (lama)', 'Menemani lebih lama, jalan-jalan di sekitar rumah.', 60, 50000, FALSE, TRUE, 'sedang', 'a0000003-0000-0000-0000-000000000003', NULL, NULL),
    ('b0000007-0000-0000-0000-000000000007', 'Bantuan Teknologi (lama)', 'Setup perangkat, ajarkan aplikasi, troubleshoot.', 45, 40000, FALSE, TRUE, 'sedang', 'a0000004-0000-0000-0000-000000000004', NULL, NULL),
    ('b0000008-0000-0000-0000-000000000008', 'Antar Obat (sedang, 1-3 km)', 'Perlu motor/sepeda, apotek agak jauh.', 45, 35000, FALSE, TRUE, 'sedang', 'a0000001-0000-0000-0000-000000000001', 1, 3),
    ('b0000009-0000-0000-0000-000000000009', 'Belanja Kebutuhan (standar)', 'Belanja harian ke warung/minimarket, pegang uang keluarga.', 60, 40000, FALSE, TRUE, 'sedang', 'a0000005-0000-0000-0000-000000000005', NULL, NULL);

-- Insert leaf categories BERAT
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
VALUES
    ('b0000010-0000-0000-0000-000000000010', 'Antar Obat (jauh, >3 km)', 'Ke faskes/apotek jauh, perlu transportasi.', 90, 55000, FALSE, TRUE, 'berat', 'a0000001-0000-0000-0000-000000000001', 3, NULL),
    ('b0000011-0000-0000-0000-000000000011', 'Bersih-bersih Menyeluruh', 'Bersih beberapa ruangan, kamar mandi, dapur.', 90, 70000, FALSE, TRUE, 'berat', 'a0000002-0000-0000-0000-000000000002', NULL, NULL),
    ('b0000012-0000-0000-0000-000000000012', 'Kontrol Kesehatan (antar ke faskes)', 'Mendampingi lansia perjalanan pergi & pulang ke klinik/RS.', 120, 120000, TRUE, TRUE, 'berat', NULL, NULL, NULL),
    ('b0000013-0000-0000-0000-000000000013', 'Belanja Kebutuhan (besar/jauh)', 'Belanja banyak item, ke pasar/supermarket jauh.', 90, 65000, FALSE, TRUE, 'berat', 'a0000005-0000-0000-0000-000000000005', NULL, NULL);

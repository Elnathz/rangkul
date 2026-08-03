-- Seed Data for Rangkul (ITechno Cup 2026)
-- Based on TDD_Rangkul.md v5.0 (§6 & §19 Data Seeder)

-- ============================================================================
-- 1. SEED SERVICE CATEGORIES (§6 & §3.4.1)
-- ============================================================================

INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'Antar Obat', 'Mengambil dan mengantarkan obat dari apotek/faskes langsung ke rumah lansia.', 30, 35000, FALSE, TRUE),
    ('c0000002-0000-0000-0000-000000000002', 'Pengingat Obat', 'Kunjungan singkat untuk memandu dan memastikan lansia meminum obat tepat dosis & waktu.', 30, 25000, FALSE, TRUE),
    ('c0000003-0000-0000-0000-000000000003', 'Belanja Kebutuhan', 'Membantu membelikan bahan makanan, kebutuhan harian, atau keperluan lansia di pasar/supermarket.', 60, 40000, FALSE, TRUE),
    ('c0000004-0000-0000-0000-000000000004', 'Menemani Mengobrol', 'Mendampingi lansia beraktivitas ringan, mengobrol hangat, mendengarkan cerita, atau berjalan sore.', 60, 50000, FALSE, TRUE),
    ('c0000005-0000-0000-0000-000000000005', 'Membersihkan Rumah Ringan', 'Membantu menyapu, merapikan kamar tidur lansia, serta membuang sampah.', 90, 70000, FALSE, TRUE),
    ('c0000006-0000-0000-0000-000000000006', 'Bantuan Teknologi', 'Membantu lansia mengoperasikan smartphone, melakukan video call dengan keluarga rantau, atau tv.', 45, 30000, FALSE, TRUE),
    ('c0000007-0000-0000-0000-000000000007', 'Kontrol Kesehatan (antar ke faskes)', 'Mendampingi lansia perjalanan pergi & pulang serta mengantre saat kontrol rutin di klinik/RS.', 90, 120000, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    deskripsi = EXCLUDED.deskripsi,
    estimasi_durasi_menit = EXCLUDED.estimasi_durasi_menit,
    harga_dasar = EXCLUDED.harga_dasar,
    is_high_risk = EXCLUDED.is_high_risk,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- 2. SEED AUTH USERS & PUBLIC USERS (Demo Accounts)
-- Password for all demo accounts: RangkulDemo2026!
-- ============================================================================

-- Admin User
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@rangkul.id',
    '$2a$10$e88nKkGjJgGjJgGjJgGjJuO610Vn.vH/Y9pG62hKqYq8rM9O1V2Wq',
    NOW(),
    '{"full_name": "Admin Rangkul Platform", "role": "admin"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Keluarga Demo
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'keluarga.demo@rangkul.id',
    '$2a$10$e88nKkGjJgGjJgGjJgGjJuO610Vn.vH/Y9pG62hKqYq8rM9O1V2Wq',
    NOW(),
    '{"full_name": "Budi Santoso (Keluarga)", "role": "keluarga"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Koordinator Demo (RT 05 / RW 02)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES (
    'c0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'koordinator.demo@rangkul.id',
    '$2a$10$e88nKkGjJgGjJgGjJgGjJuO610Vn.vH/Y9pG62hKqYq8rM9O1V2Wq',
    NOW(),
    '{"full_name": "Pak Pakusadewo (Ketua RT 05)", "role": "koordinator"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Helper Demo (Andi)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES (
    'd0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'helper.demo@rangkul.id',
    '$2a$10$e88nKkGjJgGjJgGjJgGjJuO610Vn.vH/Y9pG62hKqYq8rM9O1V2Wq',
    NOW(),
    '{"full_name": "Andi Pratama (Helper)", "role": "helper"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. SEED PROFILES (Koordinator, Helper, Lansia, Demo Wallet)
-- ============================================================================

-- Koordinator Profile
INSERT INTO public.koordinator_profiles (id, user_id, wilayah, tingkat, status, saldo_komisi)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'RT 05 / RW 02 Kel. Sukamaju',
    'rt',
    'verified',
    15000
) ON CONFLICT (user_id) DO NOTHING;

-- Helper Profile (Andi - Terpercaya)
INSERT INTO public.helper_profiles (id, user_id, ktp_url, bio, wilayah_domisili, radius_layanan_km, koordinator_id, status, tingkat_kepercayaan, tugas_selesai_berturut, rating_avg, total_tugas_selesai, saldo_tersedia)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'https://via.placeholder.com/300x200?text=KTP+Andi',
    'Mahasiswa tingkat akhir yang ramah, sabar, dan berpengalaman mendampingi kakek nenek.',
    'RT 05 / RW 02 Kel. Sukamaju',
    5,
    'e0000000-0000-0000-0000-000000000001',
    'verified',
    'terpercaya',
    5,
    4.9,
    12,
    450000
) ON CONFLICT (user_id) DO NOTHING;

-- Lansia Profile (Mbah Siti)
INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, catatan_kondisi)
VALUES (
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Ibu / Mbah Siti Aminah (72 Tahun)',
    'Jl. Cempaka No. 12, RT 05 / RW 02 Kel. Sukamaju',
    'Memiliki riwayat hipertensi ringan, senang mengobrol tentang tanaman & berkebun.'
) ON CONFLICT (id) DO NOTHING;

-- Demo Wallet for Keluarga
INSERT INTO public.demo_wallets (user_id, saldo)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    500000
) ON CONFLICT (user_id) DO UPDATE SET saldo = EXCLUDED.saldo;

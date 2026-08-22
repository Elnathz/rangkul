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
    '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6',
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
    '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6',
    NOW(),
    '{"full_name": "Budi Santoso (Keluarga)", "role": "keluarga"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Koordinator Demo (RT 03 / RW 05, Pleburan)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES (
    'c0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'koordinator.demo@rangkul.id',
    '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6',
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
    '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6',
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
    'RT 03 / RW 05 Kel. Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    'rt',
    'verified',
    15000
) ON CONFLICT (user_id) DO NOTHING;

-- Helper Profile (Andi - Terpercaya)
INSERT INTO public.helper_profiles (id, user_id, ktp_url, bio, wilayah_domisili, domisili_lat, domisili_lng, is_available, radius_layanan_km, koordinator_id, status, tingkat_kepercayaan, tugas_selesai_berturut, rating_avg, total_tugas_selesai, saldo_tersedia)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'https://via.placeholder.com/300x200?text=KTP+Andi',
    'Mahasiswa tingkat akhir yang ramah, sabar, dan berpengalaman mendampingi kakek nenek.',
    'Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah | RT 03/RW 05 | Jl. Pleburan Barat No. 12',
    -7.0051,
    110.4381,
    TRUE,
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
INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, lat, lng, catatan_kondisi)
VALUES (
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Ibu Siti Aminah (72 Tahun)',
    'Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah | RT 03/RW 05 | Jl. Pleburan Barat No. 12',
    -7.0054,
    110.4388,
    'Memiliki riwayat hipertensi ringan, senang mengobrol tentang tanaman & berkebun.'
) ON CONFLICT (id) DO NOTHING;

-- Demo Wallet for Keluarga
INSERT INTO public.demo_wallets (user_id, saldo)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    500000
) ON CONFLICT (user_id) DO UPDATE SET saldo = EXCLUDED.saldo;

-- ============================================================================
-- 4. SEED TASK MARKETPLACE NYATA
-- ============================================================================

-- Task ini sengaja tidak memiliki helper_id agar muncul di job board Helper.
-- Semua field yang dipakai kartu/detail diisi dari relasi database nyata.
INSERT INTO public.tasks (
    id,
    keluarga_id,
    lansia_id,
    helper_id,
    service_category_id,
    jadwal_waktu,
    jadwal_waktu_asli,
    reschedule_count,
    catatan,
    status,
    harga_dasar,
    harga_final,
    checkin_time,
    checkin_lat,
    checkin_lng,
    completed_at,
    cancelled_at,
    cancellation_reason,
    expires_at,
    created_at,
    updated_at
)
VALUES (
    'f1000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    NULL,
    'c0000001-0000-0000-0000-000000000001',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day',
    0,
    'Tolong datang tepat waktu dan bantu mengingatkan jadwal minum obat pagi.',
    'diajukan',
    25000,
    25000,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() + INTERVAL '1 hour',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    keluarga_id = EXCLUDED.keluarga_id,
    lansia_id = EXCLUDED.lansia_id,
    helper_id = EXCLUDED.helper_id,
    service_category_id = EXCLUDED.service_category_id,
    jadwal_waktu = EXCLUDED.jadwal_waktu,
    jadwal_waktu_asli = EXCLUDED.jadwal_waktu_asli,
    reschedule_count = EXCLUDED.reschedule_count,
    catatan = EXCLUDED.catatan,
    status = EXCLUDED.status,
    harga_dasar = EXCLUDED.harga_dasar,
    harga_final = EXCLUDED.harga_final,
    checkin_time = EXCLUDED.checkin_time,
    checkin_lat = EXCLUDED.checkin_lat,
    checkin_lng = EXCLUDED.checkin_lng,
    completed_at = EXCLUDED.completed_at,
    cancelled_at = EXCLUDED.cancelled_at,
    cancellation_reason = EXCLUDED.cancellation_reason,
    expires_at = EXCLUDED.expires_at,
    updated_at = EXCLUDED.updated_at;

-- Booking direct demo. Task ini sudah ditujukan ke Helper sehingga muncul di
-- tab Aktif dengan status diajukan dan memicu notifikasi in-app.
INSERT INTO public.tasks (
    id,
    keluarga_id,
    lansia_id,
    helper_id,
    service_category_id,
    jadwal_waktu,
    jadwal_waktu_asli,
    reschedule_count,
    catatan,
    status,
    harga_dasar,
    harga_final,
    expires_at,
    created_at,
    updated_at
)
VALUES (
    'f1000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'c0000002-0000-0000-0000-000000000002',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days',
    0,
    'Booking direct dari keluarga. Konfirmasi ketersediaanmu sebelum jadwal dimulai.',
    'diajukan',
    25000,
    25000,
    NOW() + INTERVAL '1 hour',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    keluarga_id = EXCLUDED.keluarga_id,
    lansia_id = EXCLUDED.lansia_id,
    helper_id = EXCLUDED.helper_id,
    service_category_id = EXCLUDED.service_category_id,
    jadwal_waktu = EXCLUDED.jadwal_waktu,
    jadwal_waktu_asli = EXCLUDED.jadwal_waktu_asli,
    reschedule_count = EXCLUDED.reschedule_count,
    catatan = EXCLUDED.catatan,
    status = EXCLUDED.status,
    harga_dasar = EXCLUDED.harga_dasar,
    harga_final = EXCLUDED.harga_final,
    expires_at = EXCLUDED.expires_at,
    updated_at = EXCLUDED.updated_at;

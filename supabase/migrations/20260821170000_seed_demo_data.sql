-- Data demo untuk environment yang tidak menjalankan supabase db reset.
-- Semua relasi memakai UUID yang dibuat database dan marker untuk idempotency.

DO $$
DECLARE
  keluarga_user_id UUID;
  koordinator_user_id UUID;
  helper_user_id UUID;
  koordinator_profile_id UUID;
  helper_profile_id UUID;
  lansia_profile_id UUID;
  service_category_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_categories WHERE nama = 'Menemani Mengobrol (singkat)') THEN
    INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat)
    VALUES (gen_random_uuid(), 'Menemani Mengobrol (singkat)', 'Kunjungan singkat untuk menemani dan mengecek keadaan umum lansia.', 30, 30000, FALSE, TRUE, 'ringan');
  END IF;

  SELECT id INTO service_category_id
  FROM public.service_categories
  WHERE nama = 'Menemani Mengobrol (singkat)'
  LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo.approval.keluarga@rangkul.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (gen_random_uuid(), gen_random_uuid(), 'demo.approval.keluarga@rangkul.id', '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Keluarga Demo Approval","role":"keluarga","username":"demo_approval_keluarga"}', 'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo.approval.koordinator@rangkul.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (gen_random_uuid(), gen_random_uuid(), 'demo.approval.koordinator@rangkul.id', '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Koordinator Demo Approval","role":"koordinator","username":"demo_approval_koordinator"}', 'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo.approval.helper@rangkul.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (gen_random_uuid(), gen_random_uuid(), 'demo.approval.helper@rangkul.id', '$2b$10$TAIlCBwQS8CoEWeVYg6G3.cknUg1KgyDRdlbdgmiDXjundKA4Zel6', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Helper Demo Approval","role":"helper","username":"demo_approval_helper"}', 'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  SELECT id INTO keluarga_user_id FROM auth.users WHERE email = 'demo.approval.keluarga@rangkul.id';
  SELECT id INTO koordinator_user_id FROM auth.users WHERE email = 'demo.approval.koordinator@rangkul.id';
  SELECT id INTO helper_user_id FROM auth.users WHERE email = 'demo.approval.helper@rangkul.id';

  IF NOT EXISTS (SELECT 1 FROM public.koordinator_profiles WHERE user_id = koordinator_user_id) THEN
    INSERT INTO public.koordinator_profiles (id, user_id, wilayah, tingkat, status, saldo_komisi)
    VALUES (gen_random_uuid(), koordinator_user_id, 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', 'rt', 'verified', 0);
  END IF;
  SELECT id INTO koordinator_profile_id FROM public.koordinator_profiles WHERE user_id = koordinator_user_id;

  IF NOT EXISTS (SELECT 1 FROM public.helper_profiles WHERE user_id = helper_user_id) THEN
    INSERT INTO public.helper_profiles (id, user_id, bio, wilayah_domisili, domisili_lat, domisili_lng, is_available, radius_layanan_km, koordinator_id, status, tingkat_kepercayaan, rating_avg, total_tugas_selesai, saldo_tersedia)
    VALUES (gen_random_uuid(), helper_user_id, 'Pendamping lokal yang siap menemani lansia dengan sabar dan terjadwal.', 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0051, 110.4381, TRUE, 5, koordinator_profile_id, 'verified', 'probation', 0, 0, 0);
  END IF;
  SELECT id INTO helper_profile_id FROM public.helper_profiles WHERE user_id = helper_user_id;

  IF NOT EXISTS (SELECT 1 FROM public.lansia_profiles WHERE keluarga_id = keluarga_user_id AND nama = 'Ibu Siti Demo Approval') THEN
    INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, lat, lng, catatan_kondisi, provinsi, kabupaten_kota, kecamatan, kelurahan, rt, rw, foto_url)
    VALUES (gen_random_uuid(), keluarga_user_id, 'Ibu Siti Demo Approval', 'Jl. Pleburan Barat No. 12', -7.0054, 110.4388, 'Perlu ditemani mengobrol dan diingatkan minum obat.', 'Jawa Tengah', 'Kota Semarang', 'Semarang Selatan', 'Pleburan', 3, 5, NULL);
  END IF;
  SELECT id INTO lansia_profile_id FROM public.lansia_profiles WHERE keluarga_id = keluarga_user_id AND nama = 'Ibu Siti Demo Approval' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = '[DEMO_APPROVAL_TASK] Menunggu review Koordinator') THEN
    INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, reschedule_count, catatan, status, harga_dasar, harga_final, expires_at)
    VALUES (gen_random_uuid(), keluarga_user_id, lansia_profile_id, helper_profile_id, service_category_id, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days', 0, '[DEMO_APPROVAL_TASK] Menunggu review Koordinator', 'menunggu_persetujuan_koordinator', 30000, 30000, NOW() + INTERVAL '1 day');
  END IF;
END $$;

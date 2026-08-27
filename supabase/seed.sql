-- Seed data demo idempoten untuk database cloud maupun lokal.
-- Jalankan dengan npm run seed. Tidak ada UUID manual untuk relasi demo.
BEGIN;

-- Sprint 0 sampai 2: matriks data demo idempoten sesuai TDD Â§19.
-- Semua UUID dibuat database. Relasi demo dicari berdasarkan email, username, atau marker.

DO $$
DECLARE
  user_data RECORD;
  admin_id UUID;
  keluarga_1_id UUID;
  keluarga_2_id UUID;
  keluarga_3_id UUID;
  keluarga_4_id UUID;
  koordinator_rt_2_user_id UUID;
  koordinator_rt_3_user_id UUID;
  koordinator_rw_user_id UUID;
  helper_1_user_id UUID;
  helper_2_user_id UUID;
  helper_3_user_id UUID;
  helper_4_user_id UUID;
  helper_5_user_id UUID;
  helper_6_user_id UUID;
  helper_7_user_id UUID;
  core_koordinator_user_id UUID;
  core_koordinator_profile_id UUID;
  core_helper_user_id UUID;
  koordinator_rt_2_id UUID;
  koordinator_rt_3_id UUID;
  koordinator_rw_id UUID;
  helper_1_id UUID;
  helper_2_id UUID;
  helper_3_id UUID;
  helper_4_id UUID;
  helper_5_id UUID;
  helper_6_id UUID;
  helper_7_id UUID;
  existing_helper_id UUID;
  lansia_1_id UUID;
  lansia_2_id UUID;
  lansia_3_id UUID;
  lansia_4_id UUID;
  category_id UUID;
  ringan_category_id UUID;
  sedang_category_id UUID;
  berat_category_id UUID;
  current_task_id UUID;
  existing_user_id UUID;
  demo_password_hash TEXT := '$2b$10$FXHIF708OAcAkLVG5M4DZue2jZaOH25TzrzHPB14ooxRAc7XL2/72';
BEGIN
  FOR user_data IN
    SELECT *
    FROM (VALUES
      ('demokeluarga@rangkul.id', 'Keluarga Demo Satu', 'keluarga', 'demo_keluarga1', '081234567801', 'Jl. Pleburan Barat No. 10', 2, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demokeluarga2@rangkul.id', 'Keluarga Demo Dua', 'keluarga', 'demo_keluarga2', '081234567802', 'Jl. Pleburan Barat No. 11', 3, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demokeluarga3@rangkul.id', 'Keluarga Demo Tiga', 'keluarga', 'demo_keluarga3', '081234567803', 'Jl. Pleburan Timur No. 12', 4, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demokeluarga4@rangkul.id', 'Keluarga Demo Empat', 'keluarga', 'demo_keluarga4', '081234567804', 'Jl. Pleburan Timur No. 13', 5, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demokoordinator@rangkul.id', 'Mbah Burgas', 'koordinator', 'mbahburgas', '081234567811', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
      ('demohelper@rangkul.id', 'Mas Burgas', 'helper', 'masburgas', '081234567821', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
      ('demokoordinator2@rangkul.id', 'Koordinator Demo RT Dua', 'koordinator', 'demo_koord_rt2', '081234567812', 'Jl. Pleburan Barat No. 20', 2, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demokoordinator3@rangkul.id', 'Koordinator Demo RT Tiga', 'koordinator', 'demo_koord_rt3', '081234567813', 'Jl. Pleburan Barat No. 21', 3, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demokoordinator4@rangkul.id', 'Koordinator Demo RW', 'koordinator', 'demo_koord_rw', '081234567814', 'Jl. Pleburan Barat No. 22', 4, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper2@rangkul.id', 'Helper Demo Terpercaya Dua', 'helper', 'demo_helper_t2', '081234567822', 'Jl. Pleburan Barat No. 30', 2, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper3@rangkul.id', 'Helper Demo Terpercaya Tiga', 'helper', 'demo_helper_t3', '081234567823', 'Jl. Pleburan Barat No. 31', 3, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper4@rangkul.id', 'Helper Demo Terpercaya Empat', 'helper', 'demo_helper_t4', '081234567824', 'Jl. Pleburan Barat No. 32', 4, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper5@rangkul.id', 'Helper Demo Fallback Admin', 'helper', 'demo_helper_t5', '081234567825', 'Jl. Pleburan Barat No. 33', 5, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper6@rangkul.id', 'Helper Demo Probation Satu', 'helper', 'demo_helper_p1', '081234567826', 'Jl. Pleburan Timur No. 34', 2, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper7@rangkul.id', 'Helper Demo Probation Dua', 'helper', 'demo_helper_p2', '081234567827', 'Jl. Pleburan Timur No. 35', 3, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah'),
      ('demohelper8@rangkul.id', 'Helper Demo Under Review', 'helper', 'demo_helper_review', '081234567828', 'Jl. Pleburan Timur No. 36', 4, 5, 'Pleburan', 'Semarang Selatan', 'Kota Semarang', 'Jawa Tengah')
    ) AS data(email_address, full_name_value, role_value, username_value, phone_value, alamat_detail_value, rt_value, rw_value, kelurahan_value, kecamatan_value, kabupaten_kota_value, provinsi_value)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE LOWER(email) = LOWER(user_data.email_address)
         OR LOWER(raw_user_meta_data ->> 'username') = LOWER(user_data.username_value)
         OR EXISTS (
           SELECT 1
           FROM public.users existing_public_user
           WHERE LOWER(existing_public_user.username) = LOWER(user_data.username_value)
         )
    ) THEN
      INSERT INTO auth.users (
        id, instance_id, email, phone, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        user_data.email_address,
        user_data.phone_value,
        demo_password_hash,
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object(
          'full_name', user_data.full_name_value,
          'role', user_data.role_value,
          'username', user_data.username_value
        ),
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
      );
    END IF;

    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE LOWER(raw_user_meta_data ->> 'username') = LOWER(user_data.username_value)
    LIMIT 1;

    IF existing_user_id IS NULL THEN
      SELECT id INTO existing_user_id
      FROM public.users
      WHERE LOWER(username) = LOWER(user_data.username_value)
      LIMIT 1;
    END IF;

    UPDATE auth.users
    SET encrypted_password = demo_password_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(user_data.email_address)
       OR LOWER(raw_user_meta_data ->> 'username') = LOWER(user_data.username_value)
       OR id IN (
         SELECT existing_public_user.id
         FROM public.users existing_public_user
         WHERE LOWER(existing_public_user.username) = LOWER(user_data.username_value)
       );

    IF existing_user_id IS NOT NULL THEN
      UPDATE auth.users
      SET phone = user_data.phone_value,
          updated_at = NOW()
      WHERE id = existing_user_id;

      UPDATE public.users
      SET phone = user_data.phone_value,
          full_name = user_data.full_name_value,
          username = user_data.username_value,
          alamat_detail = user_data.alamat_detail_value,
          rt = user_data.rt_value,
          rw = user_data.rw_value,
          kelurahan = user_data.kelurahan_value,
          kecamatan = user_data.kecamatan_value,
          kabupaten_kota = user_data.kabupaten_kota_value,
          provinsi = user_data.provinsi_value,
          updated_at = NOW()
      WHERE id = existing_user_id;
    END IF;
  END LOOP;

  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = 'demoadmin@rangkul.id') THEN
      INSERT INTO auth.users (
        id, instance_id, email, phone, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'demoadmin@rangkul.id', '081234567899',
        demo_password_hash, NOW(),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', 'Admin Demo Rangkul', 'role', 'admin', 'username', 'demo_admin'),
        'authenticated', 'authenticated', NOW(), NOW()
      );
    END IF;
    SELECT id INTO admin_id
    FROM public.users
    WHERE role = 'admin'
       OR LOWER(email) = 'demoadmin@rangkul.id'
    ORDER BY CASE WHEN LOWER(email) = 'demoadmin@rangkul.id' THEN 1 ELSE 2 END
    LIMIT 1;
  END IF;

  IF admin_id IS NOT NULL THEN
    UPDATE auth.users
    SET email = 'demoadmin@rangkul.id',
        phone = '081234567899',
        encrypted_password = demo_password_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = admin_id;

    UPDATE public.users
    SET email = 'demoadmin@rangkul.id',
        phone = '081234567899',
        alamat_detail = 'Jl. Pleburan Tengah No. 99',
        rt = 9,
        rw = 5,
        kelurahan = 'Pleburan',
        kecamatan = 'Semarang Selatan',
        kabupaten_kota = 'Kota Semarang',
        provinsi = 'Jawa Tengah',
        updated_at = NOW()
    WHERE id = admin_id;
  END IF;

  SELECT id INTO keluarga_1_id
  FROM public.users
  WHERE role = 'keluarga'
    AND LOWER(email) IN (
      'demokeluarga@rangkul.id',
      'demokeluarga2@rangkul.id',
      'demokeluarga3@rangkul.id'
    )
  ORDER BY CASE LOWER(email)
    WHEN 'demokeluarga@rangkul.id' THEN 1
    WHEN 'demokeluarga2@rangkul.id' THEN 2
    ELSE 3
  END
  LIMIT 1;

  IF keluarga_1_id IS NULL THEN
    SELECT id INTO keluarga_1_id FROM public.users WHERE role = 'keluarga' LIMIT 1;
  END IF;

  SELECT id INTO keluarga_2_id FROM public.users WHERE LOWER(email) = 'demokeluarga2@rangkul.id';
  SELECT id INTO keluarga_3_id FROM public.users WHERE LOWER(email) = 'demokeluarga3@rangkul.id';
  SELECT id INTO keluarga_4_id FROM public.users WHERE LOWER(email) = 'demokeluarga4@rangkul.id';
  SELECT id INTO koordinator_rt_2_user_id FROM public.users WHERE LOWER(email) = 'demokoordinator2@rangkul.id';
  SELECT id INTO koordinator_rt_3_user_id FROM public.users WHERE LOWER(email) = 'demokoordinator3@rangkul.id';
  SELECT id INTO koordinator_rw_user_id FROM public.users WHERE LOWER(email) = 'demokoordinator4@rangkul.id';
  SELECT id INTO helper_1_user_id FROM public.users WHERE LOWER(email) = 'demohelper2@rangkul.id';
  SELECT id INTO helper_2_user_id FROM public.users WHERE LOWER(email) = 'demohelper3@rangkul.id';
  SELECT id INTO helper_3_user_id FROM public.users WHERE LOWER(email) = 'demohelper4@rangkul.id';
  SELECT id INTO helper_4_user_id FROM public.users WHERE LOWER(email) = 'demohelper5@rangkul.id';
  SELECT id INTO helper_5_user_id FROM public.users WHERE LOWER(email) = 'demohelper6@rangkul.id';
  SELECT id INTO helper_6_user_id FROM public.users WHERE LOWER(email) = 'demohelper7@rangkul.id';
  SELECT id INTO helper_7_user_id FROM public.users WHERE LOWER(email) = 'demohelper8@rangkul.id';

  INSERT INTO public.koordinator_profiles (
    id, user_id, wilayah, tingkat, status, dokumen_url, domisili_lat, domisili_lng, diverifikasi_oleh, diverifikasi_at
  )
  VALUES
    (gen_random_uuid(), koordinator_rt_2_user_id, 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', 'rt', 'verified', 'demo://koordinator-rt2', -7.0048, 110.4378, admin_id, NOW()),
    (gen_random_uuid(), koordinator_rt_3_user_id, 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', 'rt', 'verified', 'demo://koordinator-rt3', -7.0051, 110.4381, admin_id, NOW()),
    (gen_random_uuid(), koordinator_rw_user_id, 'RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', 'rw', 'verified', 'demo://koordinator-rw', -7.0050, 110.4380, admin_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    wilayah = EXCLUDED.wilayah,
    tingkat = EXCLUDED.tingkat,
    status = EXCLUDED.status,
    dokumen_url = EXCLUDED.dokumen_url,
    domisili_lat = EXCLUDED.domisili_lat,
    domisili_lng = EXCLUDED.domisili_lng,
    diverifikasi_oleh = EXCLUDED.diverifikasi_oleh,
    diverifikasi_at = EXCLUDED.diverifikasi_at,
    updated_at = NOW();

  SELECT id INTO koordinator_rt_2_id FROM public.koordinator_profiles WHERE user_id = koordinator_rt_2_user_id;
  SELECT id INTO koordinator_rt_3_id FROM public.koordinator_profiles WHERE user_id = koordinator_rt_3_user_id;
  SELECT id INTO koordinator_rw_id FROM public.koordinator_profiles WHERE user_id = koordinator_rw_user_id;

  INSERT INTO public.helper_profiles (
    id, user_id, bio, wilayah_domisili, domisili_lat, domisili_lng,
    is_available, radius_layanan_km, koordinator_id, verified_by_admin_fallback,
    status, tingkat_kepercayaan, tugas_selesai_berturut, total_tugas_selesai
  )
  VALUES
    (gen_random_uuid(), helper_1_user_id, 'Helper terpercaya wilayah RT 02.', 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0041, 110.4371, TRUE, 2, koordinator_rt_2_id, FALSE, 'verified', 'terpercaya', 7, 7),
    (gen_random_uuid(), helper_2_user_id, 'Helper terpercaya wilayah RT 03.', 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0052, 110.4382, TRUE, 3, koordinator_rt_3_id, FALSE, 'verified', 'terpercaya', 6, 6),
    (gen_random_uuid(), helper_3_user_id, 'Helper terpercaya wilayah RT 04.', 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0062, 110.4392, TRUE, 4, koordinator_rt_3_id, FALSE, 'verified', 'terpercaya', 8, 8),
    (gen_random_uuid(), helper_4_user_id, 'Helper verified dengan fallback Admin untuk wilayah baru.', 'RT 06 / RW 06, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0072, 110.4402, TRUE, 5, NULL, TRUE, 'verified', 'terpercaya', 5, 5),
    (gen_random_uuid(), helper_5_user_id, 'Helper baru yang masih probation.', 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0043, 110.4373, TRUE, 2, koordinator_rt_2_id, FALSE, 'verified', 'probation', 1, 1),
    (gen_random_uuid(), helper_6_user_id, 'Helper baru probation untuk demo approval.', 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0053, 110.4383, TRUE, 3, koordinator_rt_3_id, FALSE, 'verified', 'probation', 0, 0),
    (gen_random_uuid(), helper_7_user_id, 'Helper dengan dua laporan aktif untuk demo moderasi.', 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0063, 110.4393, FALSE, 4, koordinator_rt_3_id, FALSE, 'under_review', 'probation', 0, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    wilayah_domisili = EXCLUDED.wilayah_domisili,
    domisili_lat = EXCLUDED.domisili_lat,
    domisili_lng = EXCLUDED.domisili_lng,
    is_available = EXCLUDED.is_available,
    radius_layanan_km = EXCLUDED.radius_layanan_km,
    koordinator_id = EXCLUDED.koordinator_id,
    verified_by_admin_fallback = EXCLUDED.verified_by_admin_fallback,
    status = EXCLUDED.status,
    tingkat_kepercayaan = EXCLUDED.tingkat_kepercayaan,
    tugas_selesai_berturut = EXCLUDED.tugas_selesai_berturut,
    total_tugas_selesai = EXCLUDED.total_tugas_selesai,
    updated_at = NOW();

  SELECT id INTO helper_1_id FROM public.helper_profiles WHERE user_id = helper_1_user_id;
  SELECT id INTO helper_2_id FROM public.helper_profiles WHERE user_id = helper_2_user_id;
  SELECT id INTO helper_3_id FROM public.helper_profiles WHERE user_id = helper_3_user_id;
  SELECT id INTO helper_4_id FROM public.helper_profiles WHERE user_id = helper_4_user_id;
  SELECT id INTO helper_5_id FROM public.helper_profiles WHERE user_id = helper_5_user_id;
  SELECT id INTO helper_6_id FROM public.helper_profiles WHERE user_id = helper_6_user_id;
  SELECT id INTO helper_7_id FROM public.helper_profiles WHERE user_id = helper_7_user_id;

  SELECT hp.id INTO existing_helper_id
  FROM public.helper_profiles hp
  JOIN public.users u ON u.id = hp.user_id
  WHERE LOWER(u.username) = 'masburgas'
  LIMIT 1;
  IF existing_helper_id IS NULL THEN
    existing_helper_id := helper_1_id;
  END IF;

  SELECT id INTO ringan_category_id
  FROM public.service_categories
  WHERE nama = 'Menemani Mengobrol (singkat)' AND tingkat = 'ringan' AND is_active = TRUE
  LIMIT 1;

  SELECT id INTO sedang_category_id
  FROM public.service_categories
  WHERE nama = 'Menemani Mengobrol (lama)' AND tingkat = 'sedang' AND is_active = TRUE
  LIMIT 1;

  SELECT id INTO berat_category_id
  FROM public.service_categories
  WHERE nama = 'Bersih-bersih Menyeluruh' AND tingkat = 'berat' AND is_active = TRUE
  LIMIT 1;

  IF ringan_category_id IS NULL OR sedang_category_id IS NULL OR berat_category_id IS NULL THEN
    RAISE EXCEPTION 'Kategori demo ringan, sedang, dan berat wajib tersedia';
  END IF;

  category_id := ringan_category_id;

  INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, lat, lng, catatan_kondisi)
  SELECT gen_random_uuid(), keluarga_1_id, 'Mbah Demo Satu', 'Jl. Pleburan Barat No. 12, RT 03 / RW 05, Semarang Selatan', -7.0054, 110.4388, 'Perlu ditemani mengobrol dan diingatkan minum obat.'
  WHERE keluarga_1_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.lansia_profiles WHERE keluarga_id = keluarga_1_id AND deleted_at IS NULL);

  INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, lat, lng, catatan_kondisi)
  SELECT gen_random_uuid(), keluarga_2_id, 'Mbah Demo Dua', 'Jl. Pleburan Timur No. 2, RT 02 / RW 05, Semarang Selatan', -7.0042, 110.4372, 'Perlu ditemani berjalan ringan.'
  WHERE keluarga_2_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.lansia_profiles WHERE keluarga_id = keluarga_2_id AND nama = 'Mbah Demo Dua');

  INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, lat, lng, catatan_kondisi)
  SELECT gen_random_uuid(), keluarga_3_id, 'Mbah Demo Tiga', 'Jl. Pleburan Timur No. 3, RT 03 / RW 05, Semarang Selatan', -7.0052, 110.4382, 'Perlu diingatkan jadwal makan.'
  WHERE keluarga_3_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.lansia_profiles WHERE keluarga_id = keluarga_3_id AND nama = 'Mbah Demo Tiga');

  INSERT INTO public.lansia_profiles (id, keluarga_id, nama, alamat, lat, lng, catatan_kondisi)
  SELECT gen_random_uuid(), keluarga_4_id, 'Mbah Demo Empat', 'Jl. Pleburan Timur No. 4, RT 04 / RW 05, Semarang Selatan', -7.0062, 110.4392, 'Senang berbincang dan membaca.'
  WHERE keluarga_4_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.lansia_profiles WHERE keluarga_id = keluarga_4_id AND nama = 'Mbah Demo Empat');

  SELECT id INTO lansia_1_id FROM public.lansia_profiles WHERE keluarga_id = keluarga_1_id AND deleted_at IS NULL ORDER BY created_at LIMIT 1;
  SELECT id INTO lansia_2_id FROM public.lansia_profiles WHERE keluarga_id = keluarga_2_id AND nama = 'Mbah Demo Dua' LIMIT 1;
  SELECT id INTO lansia_3_id FROM public.lansia_profiles WHERE keluarga_id = keluarga_3_id AND nama = 'Mbah Demo Tiga' LIMIT 1;
  SELECT id INTO lansia_4_id FROM public.lansia_profiles WHERE keluarga_id = keluarga_4_id AND nama = 'Mbah Demo Empat' LIMIT 1;

  INSERT INTO public.helper_service_categories (helper_id, service_category_id)
  SELECT helper_id, category_id
  FROM (VALUES
    (existing_helper_id), (helper_1_id), (helper_2_id), (helper_3_id),
    (helper_4_id), (helper_5_id), (helper_6_id), (helper_7_id)
  ) AS helpers(helper_id)
  WHERE helper_id IS NOT NULL AND category_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.reports WHERE alasan = '[DEMO_MATRIX] Laporan pertama untuk moderasi Helper.') THEN
    INSERT INTO public.reports (id, reported_helper_id, reporter_id, alasan, status)
    VALUES (gen_random_uuid(), helper_7_user_id, keluarga_1_id, '[DEMO_MATRIX] Laporan pertama untuk moderasi Helper.', 'menunggu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.reports WHERE alasan = '[DEMO_MATRIX] Laporan kedua untuk memicu under_review.') THEN
    INSERT INTO public.reports (id, reported_helper_id, reporter_id, alasan, status)
    VALUES (gen_random_uuid(), helper_7_user_id, keluarga_2_id, '[DEMO_MATRIX] Laporan kedua untuk memicu under_review.', 'menunggu');
  END IF;

  INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, catatan, status, harga_dasar, harga_final, expires_at)
  SELECT gen_random_uuid(), keluarga_1_id, lansia_1_id, NULL, category_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day', '[DEMO_MATRIX] Task diajukan marketplace', 'diajukan', 30000, 30000, NOW() + INTERVAL '1 hour'
  WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task diajukan marketplace');

  INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, catatan, status, harga_dasar, harga_final)
  SELECT gen_random_uuid(), keluarga_2_id, lansia_2_id, helper_1_id, sedang_category_id, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days', '[DEMO_MATRIX] Task dikonfirmasi', 'dikonfirmasi', 50000, 50000
  WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task dikonfirmasi');

  INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, catatan, status, harga_dasar, harga_final)
  SELECT gen_random_uuid(), keluarga_3_id, lansia_3_id, helper_2_id, sedang_category_id, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '3 hours', '[DEMO_MATRIX] Task dikerjakan', 'dikerjakan', 50000, 50000
  WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task dikerjakan');

  INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, catatan, status, harga_dasar, harga_final, completed_at)
  SELECT gen_random_uuid(), keluarga_4_id, lansia_4_id, helper_3_id, berat_category_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '[DEMO_MATRIX] Task selesai', 'selesai', 70000, 70000, NOW() - INTERVAL '12 hours'
  WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task selesai');

  INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, catatan, status, harga_dasar, harga_final, cancelled_at, cancellation_reason)
  SELECT gen_random_uuid(), keluarga_1_id, lansia_1_id, helper_7_id, category_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', '[DEMO_MATRIX] Task dibatalkan', 'dibatalkan', 30000, 30000, NOW() - INTERVAL '1 day', 'Dibatalkan untuk skenario demo.'
  WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task dibatalkan');

  INSERT INTO public.tasks (id, keluarga_id, lansia_id, helper_id, service_category_id, jadwal_waktu, jadwal_waktu_asli, catatan, status, harga_dasar, harga_final, completed_at)
  SELECT gen_random_uuid(), keluarga_1_id, lansia_1_id, existing_helper_id, category_id, NOW() - (history.days * INTERVAL '1 day'), NOW() - (history.days * INTERVAL '1 day'), history.marker, 'selesai', 30000, 30000, NOW() - (history.days * INTERVAL '1 day')
  FROM (VALUES
    (4, '[DEMO_MATRIX] Riwayat kunjungan 1'),
    (3, '[DEMO_MATRIX] Riwayat kunjungan 2'),
    (2, '[DEMO_MATRIX] Riwayat kunjungan 3'),
    (1, '[DEMO_MATRIX] Riwayat kunjungan 4')
  ) AS history(days, marker)
  WHERE keluarga_1_id IS NOT NULL AND lansia_1_id IS NOT NULL AND existing_helper_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE catatan = history.marker);

  FOR current_task_id IN
    SELECT t.id FROM public.tasks t
    WHERE t.catatan IN ('[DEMO_MATRIX] Task selesai', '[DEMO_MATRIX] Riwayat kunjungan 1', '[DEMO_MATRIX] Riwayat kunjungan 2', '[DEMO_MATRIX] Riwayat kunjungan 3', '[DEMO_MATRIX] Riwayat kunjungan 4')
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.task_evidence e WHERE e.task_id = current_task_id) THEN
      INSERT INTO public.task_evidence (id, task_id, foto_bukti_url, catatan_kondisi, client_submission_id)
      VALUES (gen_random_uuid(), current_task_id, 'https://demo.invalid/' || current_task_id || '.jpg', 'Kunjungan demo tersimpan.', 'demo-matrix-' || current_task_id);
    END IF;
  END LOOP;

  INSERT INTO public.health_snapshots (id, task_id, lansia_id, energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini)
  SELECT gen_random_uuid(), t.id, lansia_1_id, history.score, history.score, history.score, history.score, history.score, history.story
  FROM (VALUES
    ('[DEMO_MATRIX] Riwayat kunjungan 1', 5, 'Mbah Demo Satu masih bersemangat berkebun.'),
    ('[DEMO_MATRIX] Riwayat kunjungan 2', 4, 'Mbah Demo Satu mulai lebih cepat lelah.'),
    ('[DEMO_MATRIX] Riwayat kunjungan 3', 3, 'Mbah Demo Satu perlu ditemani saat aktivitas ringan.'),
    ('[DEMO_MATRIX] Riwayat kunjungan 4', 2, 'Mbah Demo Satu perlu perhatian keluarga.')
  ) AS history(marker, score, story)
  JOIN public.tasks t ON t.catatan = history.marker
  WHERE NOT EXISTS (SELECT 1 FROM public.health_snapshots hs WHERE hs.task_id = t.id);

  SELECT id INTO core_koordinator_user_id FROM public.users WHERE role = 'koordinator' AND LOWER(username) = 'mbahburgas' LIMIT 1;
  SELECT id INTO core_helper_user_id FROM public.users WHERE role = 'helper' AND LOWER(username) = 'masburgas' LIMIT 1;

  IF core_koordinator_user_id IS NOT NULL THEN
    INSERT INTO public.koordinator_profiles (id, user_id, wilayah, tingkat, status, domisili_lat, domisili_lng, diverifikasi_oleh, diverifikasi_at)
    VALUES (gen_random_uuid(), core_koordinator_user_id, 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', 'rt', 'pending_verification', -7.0051, 110.4381, NULL, NULL)
    ON CONFLICT (user_id) DO UPDATE SET
      wilayah = EXCLUDED.wilayah,
      status = 'pending_verification',
      domisili_lat = EXCLUDED.domisili_lat,
      domisili_lng = EXCLUDED.domisili_lng,
      diverifikasi_oleh = NULL,
      diverifikasi_at = NULL,
      updated_at = NOW();

    SELECT id INTO core_koordinator_profile_id FROM public.koordinator_profiles WHERE user_id = core_koordinator_user_id LIMIT 1;
  END IF;

  IF core_helper_user_id IS NOT NULL THEN
    INSERT INTO public.helper_profiles (id, user_id, bio, wilayah_domisili, domisili_lat, domisili_lng, is_available, radius_layanan_km, koordinator_id, status, tingkat_kepercayaan)
    VALUES (gen_random_uuid(), core_helper_user_id, 'Helper demo utama Mas Burgas.', 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', -7.0051, 110.4381, FALSE, 5, core_koordinator_profile_id, 'pending_verification', 'probation')
    ON CONFLICT (user_id) DO UPDATE SET
      wilayah_domisili = EXCLUDED.wilayah_domisili,
      domisili_lat = EXCLUDED.domisili_lat,
      domisili_lng = EXCLUDED.domisili_lng,
      koordinator_id = EXCLUDED.koordinator_id,
      is_available = FALSE,
      status = 'pending_verification',
      updated_at = NOW();
  END IF;
END;
$$;

-- Sprint 3: fixture pembayaran, chat, SOS, dan notifikasi dengan marker stabil.
DO $$
DECLARE
  keluarga_id UUID;
  helper_user_id UUID;
  task_in_progress_id UUID;
  task_completed_id UUID;
  payment_held_id UUID;
  payment_released_id UUID;
  alert_id UUID;
BEGIN
  SELECT id INTO keluarga_id FROM public.users WHERE email = 'demokeluarga3@rangkul.id' LIMIT 1;
  SELECT hp.user_id INTO helper_user_id
  FROM public.helper_profiles hp
  JOIN public.users u ON u.id = hp.user_id
  WHERE u.email = 'demohelper3@rangkul.id'
  LIMIT 1;

  SELECT id INTO task_in_progress_id FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task dikerjakan' LIMIT 1;
  SELECT id INTO task_completed_id FROM public.tasks WHERE catatan = '[DEMO_MATRIX] Task selesai' LIMIT 1;

  IF task_in_progress_id IS NOT NULL AND keluarga_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
    INSERT INTO public.payments (
      task_id, amount, jumlah_total, helper_share, platform_fee, koordinator_share,
      status, payment_method, midtrans_order_id, held_at
    )
    SELECT task_in_progress_id, 50000, 50000, 45000, 1500, 3500,
           'held_escrow', 'midtrans', 'DEMO-HOLD-' || replace(task_in_progress_id::text, '-', ''), NOW() - INTERVAL '1 hour'
    WHERE NOT EXISTS (SELECT 1 FROM public.payments WHERE task_id = task_in_progress_id);

    SELECT id INTO payment_held_id FROM public.payments WHERE task_id = task_in_progress_id;

    IF payment_held_id IS NOT NULL THEN
      INSERT INTO public.transaction_logs (payment_id, event_type, payload)
      SELECT payment_held_id, 'held', jsonb_build_object('source', 'demo_seed', 'marker', '[DEMO_MATRIX] Payment held escrow')
      WHERE NOT EXISTS (
        SELECT 1 FROM public.transaction_logs
        WHERE payment_id = payment_held_id AND payload ->> 'marker' = '[DEMO_MATRIX] Payment held escrow'
      );

      INSERT INTO public.messages (sender_id, receiver_id, task_id, message)
      SELECT keluarga_id, helper_user_id, task_in_progress_id, '[DEMO_MATRIX] Pesan task scoped untuk kunjungan aktif.'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.messages
        WHERE task_id = task_in_progress_id AND message = '[DEMO_MATRIX] Pesan task scoped untuk kunjungan aktif.'
      );

      INSERT INTO public.emergency_alerts (task_id, triggered_by, status)
      SELECT task_in_progress_id, helper_user_id, 'active'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.emergency_alerts
        WHERE task_id = task_in_progress_id AND status = 'active'
      )
      RETURNING id INTO alert_id;

      IF alert_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, type)
        SELECT keluarga_id, 'Sinyal darurat aktif', 'Fixture SOS aktif untuk task demo.', 'emergency'
        WHERE NOT EXISTS (
          SELECT 1 FROM public.notifications
          WHERE user_id = keluarga_id AND body = 'Fixture SOS aktif untuk task demo.'
        );
      END IF;
    END IF;
  END IF;

  IF task_completed_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.payments WHERE task_id = task_completed_id) THEN
    INSERT INTO public.payments (
      task_id, amount, jumlah_total, helper_share, platform_fee, koordinator_share,
      status, payment_method, midtrans_order_id, held_at, released_at
    )
    VALUES (
      task_completed_id, 70000, 70000, 63000, 2100, 4900,
      'released', 'midtrans', 'DEMO-RELEASE-' || replace(task_completed_id::text, '-', ''), NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'
    )
    RETURNING id INTO payment_released_id;

    INSERT INTO public.transaction_logs (payment_id, event_type, payload)
    VALUES (payment_released_id, 'released', jsonb_build_object('source', 'demo_seed', 'marker', '[DEMO_MATRIX] Payment released split 90 7 3'));
  END IF;
END;
$$;

-- Sprint 4: fixture banding dan saldo demo untuk jalur Admin tanpa payment gateway.
DO $$
DECLARE
  admin_id UUID;
  keluarga_id UUID;
  demo_wallet_id UUID;
  current_saldo NUMERIC;
BEGIN
  SELECT id INTO admin_id
  FROM public.users
  WHERE role = 'admin'
  ORDER BY created_at
  LIMIT 1;

  SELECT id INTO keluarga_id
  FROM public.users
  WHERE email = 'demokeluarga4@rangkul.id'
    AND role = 'keluarga'
  LIMIT 1;

  IF keluarga_id IS NULL THEN
    SELECT id INTO keluarga_id
    FROM public.users
    WHERE role = 'keluarga'
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF admin_id IS NOT NULL AND keluarga_id IS NOT NULL THEN
    INSERT INTO public.demo_wallets (user_id, saldo)
    VALUES (keluarga_id, 200000)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT id, saldo INTO demo_wallet_id, current_saldo
    FROM public.demo_wallets
    WHERE user_id = keluarga_id;

    IF current_saldo = 0 THEN
      UPDATE public.demo_wallets
      SET saldo = 200000, updated_at = NOW()
      WHERE id = demo_wallet_id;
      current_saldo := 200000;
    END IF;

    INSERT INTO public.demo_wallet_ledger (wallet_id, user_id, amount, saldo_setelah, alasan, created_by)
    SELECT demo_wallet_id, keluarga_id, 200000, current_saldo, '[DEMO_MATRIX] Top up wallet awal', admin_id
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.demo_wallet_ledger ledger_row
      WHERE ledger_row.wallet_id = demo_wallet_id
        AND ledger_row.alasan = '[DEMO_MATRIX] Top up wallet awal'
    );

    INSERT INTO public.appeals (user_id, alasan, status)
    SELECT keluarga_id, '[DEMO_MATRIX] Banding akun restricted', 'menunggu'
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.appeals
      WHERE user_id = keluarga_id
        AND alasan = '[DEMO_MATRIX] Banding akun restricted'
    );

  END IF;
END;
$$;

-- Asset demo lokal. Tidak menimpa foto pengguna nyata.

UPDATE public.helper_profiles hp
SET foto_wajah_url = CASE
  WHEN LOWER(u.username) = 'masburgas' THEN '/images/helpers/orang1.jpeg'
  WHEN LOWER(u.username) LIKE '%helper_t2%' THEN '/images/helpers/orang2.jpg'
  WHEN LOWER(u.username) LIKE '%helper_t3%' THEN '/images/helpers/orang3.jpg'
  WHEN LOWER(u.username) LIKE '%helper_t4%' THEN '/images/helpers/orang4.jpeg'
  WHEN LOWER(u.username) LIKE '%helper_t5%' THEN '/images/helpers/orang5.jpeg'
  WHEN LOWER(u.username) LIKE '%helper_p1%' THEN '/images/helpers/orang6.jpeg'
  ELSE '/images/helpers/orang2.jpg'
END
FROM public.users u
WHERE u.id = hp.user_id
  AND u.role = 'helper'
  AND hp.foto_wajah_url IS NULL;

UPDATE public.koordinator_profiles kp
SET foto_url = CASE
  WHEN LOWER(u.username) = 'mbahburgas' THEN '/images/helpers/orang1.jpeg'
  ELSE '/images/helpers/orang2.jpg'
END
FROM public.users u
WHERE u.id = kp.user_id AND kp.foto_url IS NULL;

UPDATE public.lansia_profiles
SET foto_url = CASE
  WHEN nama ILIKE '%Satu%' THEN '/images/helpers/orang3.jpg'
  WHEN nama ILIKE '%Dua%' THEN '/images/helpers/orang4.jpeg'
  WHEN nama ILIKE '%Tiga%' THEN '/images/helpers/orang5.jpeg'
  ELSE '/images/helpers/orang6.jpeg'
END
WHERE foto_url IS NULL AND nama LIKE 'Mbah Demo%';

COMMIT;

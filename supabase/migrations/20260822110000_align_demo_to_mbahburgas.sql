-- Kaitkan task approval demo ke akun yang dipakai saat demo.
-- Migration ini tidak membuat akun baru jika akun target belum ada.

DO $$
DECLARE
  koordinator_user_id UUID;
  koordinator_profile_id UUID;
  helper_profile_id UUID;
  lansia_profile_id UUID;
BEGIN
  SELECT id INTO koordinator_user_id
  FROM public.users
  WHERE LOWER(username) = 'mbahburgas'
    AND role = 'koordinator'
  LIMIT 1;

  IF koordinator_user_id IS NULL THEN
    SELECT id INTO koordinator_user_id
    FROM public.users
    WHERE LOWER(email) = 'demo.approval.koordinator@rangkul.id'
      AND role = 'koordinator'
    LIMIT 1;
  END IF;

  IF koordinator_user_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.users
  SET username = CASE
        WHEN NOT EXISTS (
          SELECT 1 FROM public.users existing
          WHERE LOWER(existing.username) = 'mbahburgas'
            AND existing.id <> koordinator_user_id
        ) THEN 'mbahburgas'
        ELSE username
      END,
      full_name = CASE WHEN LOWER(email) = 'demo.approval.koordinator@rangkul.id' THEN 'Mbah Burgas' ELSE full_name END,
      updated_at = NOW()
  WHERE id = koordinator_user_id;

  IF NOT EXISTS (SELECT 1 FROM public.koordinator_profiles WHERE user_id = koordinator_user_id) THEN
    INSERT INTO public.koordinator_profiles (id, user_id, wilayah, tingkat, status, saldo_komisi)
    VALUES (gen_random_uuid(), koordinator_user_id, 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah', 'rt', 'verified', 0);
  END IF;

  UPDATE public.koordinator_profiles
  SET wilayah = 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
      status = 'verified',
      updated_at = NOW()
  WHERE user_id = koordinator_user_id;

  SELECT id INTO koordinator_profile_id
  FROM public.koordinator_profiles
  WHERE user_id = koordinator_user_id
  LIMIT 1;

  SELECT hp.id INTO helper_profile_id
  FROM public.helper_profiles AS hp
  JOIN public.users AS u ON u.id = hp.user_id
  WHERE LOWER(u.username) = 'masburgas'
  LIMIT 1;

  IF helper_profile_id IS NULL THEN
    SELECT hp.id INTO helper_profile_id
    FROM public.helper_profiles AS hp
    JOIN public.users AS u ON u.id = hp.user_id
    WHERE LOWER(u.email) = 'demo.approval.helper@rangkul.id'
    LIMIT 1;
  END IF;

  IF helper_profile_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.users helper_user
  SET username = CASE
        WHEN NOT EXISTS (
          SELECT 1 FROM public.users existing
          WHERE LOWER(existing.username) = 'masburgas'
            AND existing.id <> helper_user.id
        ) THEN 'masburgas'
        ELSE helper_user.username
      END,
      full_name = CASE WHEN LOWER(helper_user.email) = 'demo.approval.helper@rangkul.id' THEN 'Mas Burgas' ELSE helper_user.full_name END,
      updated_at = NOW()
  WHERE helper_user.id = (SELECT user_id FROM public.helper_profiles WHERE id = helper_profile_id);

  UPDATE public.helper_profiles
  SET koordinator_id = koordinator_profile_id,
      wilayah_domisili = 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
      domisili_lat = -7.0051,
      domisili_lng = 110.4381,
      updated_at = NOW()
  WHERE id = helper_profile_id;

  SELECT id INTO lansia_profile_id
  FROM public.lansia_profiles
  WHERE nama = 'Ibu Siti Demo Approval'
  LIMIT 1;

  IF lansia_profile_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.lansia_profiles
  SET alamat = 'Jl. Pleburan Barat No. 12',
      lat = -7.0054,
      lng = 110.4388,
      provinsi = 'Jawa Tengah',
      kabupaten_kota = 'Kota Semarang',
      kecamatan = 'Semarang Selatan',
      kelurahan = 'Pleburan',
      rt = 3,
      rw = 5,
      updated_at = NOW()
  WHERE id = lansia_profile_id;

  UPDATE public.tasks
  SET helper_id = helper_profile_id,
      lansia_id = lansia_profile_id,
      status = 'menunggu_persetujuan_koordinator',
      updated_at = NOW()
  WHERE catatan = '[DEMO_APPROVAL_TASK] Menunggu review Koordinator';
END $$;

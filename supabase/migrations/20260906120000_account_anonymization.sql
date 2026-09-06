-- Account deletion keeps the minimum history needed for task, payment, and audit integrity.
-- Direct identifiers and private profile references are removed first, then Auth is soft-deleted by the route.

CREATE OR REPLACE FUNCTION public._anonymize_user(target_user_id UUID)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  target public.users;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Sesi tidak ditemukan';
  END IF;

  IF NOT (target_user_id = actor_id OR public.is_admin()) THEN
    RAISE EXCEPTION 'Tidak memiliki akses untuk menganonimkan akun ini';
  END IF;

  SELECT * INTO target FROM public.users WHERE id = target_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengguna tidak ditemukan';
  END IF;

  UPDATE public.lansia_profiles
  SET nama = 'Profil lansia dihapus',
      alamat = 'Alamat dihapus',
      lat = NULL,
      lng = NULL,
      catatan_kondisi = NULL,
      foto_url = NULL,
      hubungan_keluarga = NULL,
      dokumen_identitas_lansia_url = NULL,
      dokumen_hubungan_keluarga_url = NULL,
      provinsi = NULL,
      kabupaten_kota = NULL,
      kecamatan = NULL,
      kelurahan = NULL,
      rt = NULL,
      rw = NULL,
      deleted_at = COALESCE(deleted_at, NOW()),
      updated_at = NOW()
  WHERE keluarga_id = target_user_id;

  UPDATE public.helper_profiles
  SET ktp_url = NULL,
      foto_wajah_url = NULL,
      bio = 'Profil Helper dihapus',
      wilayah_domisili = 'Wilayah disembunyikan',
      domisili_lat = NULL,
      domisili_lng = NULL,
      is_available = FALSE,
      koordinator_id = NULL,
      status = 'suspended',
      suspend_reason = 'Akun dianonimkan atas permintaan pengguna',
      updated_at = NOW()
  WHERE user_id = target_user_id;

  UPDATE public.koordinator_profiles
  SET wilayah = 'Wilayah disembunyikan',
      dokumen_url = NULL,
      ktp_url = NULL,
      foto_url = NULL,
      domisili_lat = NULL,
      domisili_lng = NULL,
      status = 'suspended',
      updated_at = NOW()
  WHERE user_id = target_user_id;

  UPDATE public.users
  SET email = 'deleted+' || REPLACE(target_user_id::text, '-', '') || '@invalid.rangkul.local',
      phone = NULL,
      full_name = 'Pengguna dihapus',
      username = 'dihapus_' || LEFT(REPLACE(target_user_id::text, '-', ''), 12),
      alamat_detail = NULL,
      rt = NULL,
      rw = NULL,
      kelurahan = NULL,
      kecamatan = NULL,
      kabupaten_kota = NULL,
      provinsi = NULL,
      account_status = 'suspended',
      updated_at = NOW()
  WHERE id = target_user_id
  RETURNING * INTO target;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    actor_id,
    'account_anonymized',
    'user',
    target_user_id,
    jsonb_build_object('role', target.role, 'reason', 'account_deletion')
  );

  RETURN target;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_anonymize_user(target_user_id UUID)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat menganonimkan akun lain';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Admin tidak dapat menganonimkan akun sendiri';
  END IF;
  RETURN public._anonymize_user(target_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.anonymize_own_account()
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role public.user_role;
BEGIN
  SELECT role INTO current_role FROM public.users WHERE id = auth.uid();
  IF current_role = 'admin' THEN
    RAISE EXCEPTION 'Akun Admin harus diproses oleh Admin lain';
  END IF;
  RETURN public._anonymize_user(auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public._anonymize_user(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_anonymize_user(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anonymize_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_anonymize_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_own_account() TO authenticated;

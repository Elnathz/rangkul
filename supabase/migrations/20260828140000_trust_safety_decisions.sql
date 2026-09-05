ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS decision_reason TEXT;

ALTER TABLE public.appeals
  ADD COLUMN IF NOT EXISTS review_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS appeals_one_pending_per_user_idx
  ON public.appeals (user_id)
  WHERE status = 'menunggu';

CREATE OR REPLACE FUNCTION public.review_report(
  p_report_id UUID,
  p_status public.report_status,
  p_helper_status public.helper_status DEFAULT NULL,
  p_decision_reason TEXT DEFAULT NULL
)
RETURNS public.reports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report public.reports;
  v_helper public.helper_profiles;
  v_is_admin BOOLEAN;
  v_other_active_reports INTEGER;
  v_audit_action TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi reviewer tidak valid' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('ditindak', 'selesai') THEN
    RAISE EXCEPTION 'Keputusan laporan tidak valid' USING ERRCODE = '22023';
  END IF;
  IF NULLIF(BTRIM(p_decision_reason), '') IS NULL OR LENGTH(BTRIM(p_decision_reason)) < 10 THEN
    RAISE EXCEPTION 'Alasan keputusan minimal 10 karakter' USING ERRCODE = '22023';
  END IF;
  IF p_status = 'ditindak' AND p_helper_status IS NOT NULL THEN
    RAISE EXCEPTION 'Status Helper hanya diputus saat laporan diselesaikan' USING ERRCODE = '22023';
  END IF;
  IF p_helper_status IS NOT NULL AND p_helper_status NOT IN ('verified', 'suspended') THEN
    RAISE EXCEPTION 'Keputusan status Helper tidak valid' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_report
  FROM public.reports
  WHERE id = p_report_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Laporan tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_report.status NOT IN ('menunggu', 'ditindak')
    OR (p_status = 'ditindak' AND v_report.status <> 'menunggu') THEN
    RAISE EXCEPTION 'Laporan sudah diputus reviewer lain' USING ERRCODE = 'P0001';
  END IF;

  v_is_admin := public.is_admin();
  SELECT hp.* INTO v_helper
  FROM public.helper_profiles hp
  JOIN public.users hu ON hu.id = hp.user_id
  WHERE hp.user_id = v_report.reported_helper_id
    AND (
      v_is_admin
      OR EXISTS (
        SELECT 1
        FROM public.koordinator_profiles kp
        JOIN public.users ku ON ku.id = kp.user_id
        WHERE kp.user_id = auth.uid()
          AND kp.status = 'verified'
          AND LOWER(BTRIM(ku.kelurahan)) = LOWER(BTRIM(hu.kelurahan))
          AND ku.rw = hu.rw
          AND (kp.tingkat = 'rw' OR (kp.tingkat = 'rt' AND ku.rt = hu.rt))
      )
    )
  FOR UPDATE OF hp;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reviewer tidak memiliki scope untuk laporan ini' USING ERRCODE = '42501';
  END IF;

  IF p_helper_status = 'verified' THEN
    SELECT COUNT(*) INTO v_other_active_reports
    FROM public.reports
    WHERE reported_helper_id = v_report.reported_helper_id
      AND id <> v_report.id
      AND status IN ('menunggu', 'ditindak');
    IF v_other_active_reports > 0 THEN
      RAISE EXCEPTION 'Masih ada laporan aktif lain untuk Helper ini' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE public.reports
  SET status = p_status,
      ditindak_oleh = auth.uid(),
      decision_reason = BTRIM(p_decision_reason),
      updated_at = NOW()
  WHERE id = v_report.id
  RETURNING * INTO v_report;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'review_report', 'report', v_report.id, jsonb_build_object(
    'report_status', p_status,
    'helper_status', p_helper_status,
    'decision_reason', BTRIM(p_decision_reason),
    'reported_helper_id', v_report.reported_helper_id
  ));

  IF p_helper_status IS NOT NULL THEN
    UPDATE public.helper_profiles
    SET status = p_helper_status,
        suspend_reason = CASE WHEN p_helper_status = 'suspended' THEN BTRIM(p_decision_reason) ELSE NULL END,
        tingkat_kepercayaan = CASE WHEN p_helper_status = 'verified' THEN 'probation' ELSE tingkat_kepercayaan END,
        tugas_selesai_berturut = CASE WHEN p_helper_status = 'verified' THEN 0 ELSE tugas_selesai_berturut END,
        verified_by_admin_fallback = CASE WHEN p_helper_status = 'suspended' THEN FALSE ELSE verified_by_admin_fallback END,
        updated_at = NOW()
    WHERE id = v_helper.id;

    v_audit_action := CASE WHEN p_helper_status = 'verified' THEN 'restore_helper' ELSE 'suspend_helper' END;
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (auth.uid(), v_audit_action, 'helper_profile', v_helper.id, jsonb_build_object(
      'report_id', v_report.id,
      'reason', BTRIM(p_decision_reason)
    ));
  END IF;

  RETURN v_report;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_decide_helper_status(
  p_helper_id UUID,
  p_status public.helper_status,
  p_reason TEXT
)
RETURNS public.helper_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_helper public.helper_profiles;
  v_action TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat mengubah status Helper' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('verified', 'suspended') THEN
    RAISE EXCEPTION 'Keputusan status Helper tidak valid' USING ERRCODE = '22023';
  END IF;
  IF NULLIF(BTRIM(p_reason), '') IS NULL OR LENGTH(BTRIM(p_reason)) < 10 THEN
    RAISE EXCEPTION 'Alasan keputusan minimal 10 karakter' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_helper FROM public.helper_profiles WHERE id = p_helper_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Helper tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF p_status = 'suspended' AND v_helper.status NOT IN ('verified', 'under_review') THEN
    RAISE EXCEPTION 'Status Helper sudah berubah' USING ERRCODE = 'P0001';
  END IF;
  IF p_status = 'verified' AND v_helper.status <> 'suspended' THEN
    RAISE EXCEPTION 'Pemulihan hanya untuk Helper suspended' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.helper_profiles
  SET status = p_status,
      suspend_reason = CASE WHEN p_status = 'suspended' THEN BTRIM(p_reason) ELSE NULL END,
      tingkat_kepercayaan = 'probation',
      tugas_selesai_berturut = 0,
      verified_by_admin_fallback = CASE WHEN p_status = 'suspended' THEN FALSE ELSE verified_by_admin_fallback END,
      updated_at = NOW()
  WHERE id = p_helper_id
  RETURNING * INTO v_helper;

  v_action := CASE WHEN p_status = 'verified' THEN 'restore_helper' ELSE 'suspend_helper' END;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), v_action, 'helper_profile', p_helper_id, jsonb_build_object('reason', BTRIM(p_reason)));
  RETURN v_helper;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_admin_fallback(
  p_helper_id UUID,
  p_reason TEXT
)
RETURNS public.helper_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_helper public.helper_profiles;
  v_helper_user public.users;
  v_coordinator_exists BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat menetapkan fallback' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(p_reason), '') IS NULL OR LENGTH(BTRIM(p_reason)) < 10 THEN
    RAISE EXCEPTION 'Alasan fallback minimal 10 karakter' USING ERRCODE = '22023';
  END IF;

  LOCK TABLE public.koordinator_profiles IN SHARE MODE;
  LOCK TABLE public.users IN SHARE MODE;
  SELECT * INTO v_helper FROM public.helper_profiles WHERE id = p_helper_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Helper tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_helper.status <> 'pending_verification' OR v_helper.verified_by_admin_fallback THEN
    RAISE EXCEPTION 'Status Helper sudah berubah' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_helper_user FROM public.users WHERE id = v_helper.user_id;
  IF v_helper_user.kelurahan IS NULL OR v_helper_user.rw IS NULL OR v_helper_user.rt IS NULL THEN
    RAISE EXCEPTION 'Wilayah canonical Helper belum lengkap' USING ERRCODE = '22023';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.koordinator_profiles kp
    JOIN public.users ku ON ku.id = kp.user_id
    WHERE kp.status = 'verified'
      AND LOWER(BTRIM(ku.kelurahan)) = LOWER(BTRIM(v_helper_user.kelurahan))
      AND ku.rw = v_helper_user.rw
      AND (
        (kp.tingkat = 'rt' AND ku.rt = v_helper_user.rt)
        OR kp.tingkat = 'rw'
      )
  ) INTO v_coordinator_exists;
  IF v_coordinator_exists THEN
    RAISE EXCEPTION 'Koordinator RT atau RW aktif tersedia untuk wilayah Helper' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.helper_profiles
  SET status = 'verified',
      koordinator_id = NULL,
      verified_by_admin_fallback = TRUE,
      tingkat_kepercayaan = 'probation',
      tugas_selesai_berturut = 0,
      suspend_reason = NULL,
      updated_at = NOW()
  WHERE id = p_helper_id
  RETURNING * INTO v_helper;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'assign_admin_fallback', 'helper_profile', p_helper_id, jsonb_build_object(
    'reason', BTRIM(p_reason),
    'kelurahan', v_helper_user.kelurahan,
    'rt', v_helper_user.rt,
    'rw', v_helper_user.rw
  ));
  RETURN v_helper;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_appeal(
  appeal_id UUID,
  next_status public.appeal_status,
  review_reason TEXT
)
RETURNS public.appeals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appeal public.appeals;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat meninjau banding' USING ERRCODE = '42501';
  END IF;
  IF next_status NOT IN ('disetujui', 'ditolak') THEN
    RAISE EXCEPTION 'Keputusan banding tidak valid' USING ERRCODE = '22023';
  END IF;
  IF NULLIF(BTRIM(review_reason), '') IS NULL OR LENGTH(BTRIM(review_reason)) < 10 THEN
    RAISE EXCEPTION 'Alasan keputusan minimal 10 karakter' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_appeal
  FROM public.appeals
  WHERE id = appeal_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banding tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_appeal.status <> 'menunggu' THEN
    RAISE EXCEPTION 'Banding sudah diputus reviewer lain' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.appeals
  SET status = next_status,
      review_reason = BTRIM(review_reason),
      direview_oleh = auth.uid(),
      direview_at = NOW()
  WHERE id = appeal_id AND status = 'menunggu'
  RETURNING * INTO v_appeal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banding sudah diputus reviewer lain' USING ERRCODE = 'P0001';
  END IF;

  PERFORM set_config('rangkul.allow_sensitive_user_update', 'on', TRUE);
  UPDATE public.users
  SET account_status = CASE WHEN next_status = 'disetujui' THEN 'active'::public.account_status ELSE 'restricted'::public.account_status END,
      updated_at = NOW()
  WHERE id = v_appeal.user_id;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'resolve_appeal', 'appeal', appeal_id, jsonb_build_object(
    'status', next_status,
    'reason', BTRIM(review_reason),
    'user_id', v_appeal.user_id
  ));
  RETURN v_appeal;
END;
$$;

REVOKE ALL ON FUNCTION public.review_report(UUID, public.report_status, public.helper_status, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_decide_helper_status(UUID, public.helper_status, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assign_admin_fallback(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_review_appeal(UUID, public.appeal_status, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_report(UUID, public.report_status, public.helper_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_helper_status(UUID, public.helper_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_fallback(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_appeal(UUID, public.appeal_status, TEXT) TO authenticated;

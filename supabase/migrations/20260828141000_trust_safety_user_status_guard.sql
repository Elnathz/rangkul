CREATE OR REPLACE FUNCTION public.prevent_sensitive_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_setting('rangkul.allow_sensitive_user_update', TRUE) = 'on' THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.account_status IS DISTINCT FROM OLD.account_status
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Perubahan kolom sensitif tidak diizinkan' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
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

REVOKE ALL ON FUNCTION public.admin_review_appeal(UUID, public.appeal_status, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_review_appeal(UUID, public.appeal_status, TEXT) TO authenticated;

-- Menyelesaikan intent refund, kompensasi, dan auto-release payment.

CREATE OR REPLACE FUNCTION public.prepare_midtrans_refund(p_task_id UUID)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Refund manual hanya dapat diproses Admin' USING ERRCODE = '42501';
  END IF;
  SELECT p.* INTO v_payment
  FROM public.payments p
  JOIN public.tasks t ON t.id = p.task_id
  WHERE p.task_id = p_task_id AND t.status = 'dibatalkan'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pembayaran tugas tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_payment.status IN ('refunded', 'refunding') THEN RETURN v_payment; END IF;
  IF v_payment.status <> 'held_escrow' THEN
    RAISE EXCEPTION 'Refund hanya tersedia untuk pembayaran held' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.payments
  SET status = 'refunding', updated_at = NOW()
  WHERE id = v_payment.id AND status = 'held_escrow'
  RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_midtrans_refund(
  p_task_id UUID, p_gateway_ref TEXT, p_payload JSONB
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_payment public.payments;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Refund manual hanya dapat diproses Admin' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pembayaran tugas tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  IF v_payment.status = 'refunded' THEN RETURN v_payment; END IF;
  IF v_payment.status <> 'refunding' THEN
    RAISE EXCEPTION 'Intent refund belum tersimpan' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.payments
  SET status = 'refunded',
      gateway_ref = COALESCE(NULLIF(BTRIM(p_gateway_ref), ''), gateway_ref),
      updated_at = NOW()
  WHERE id = v_payment.id AND status = 'refunding'
  RETURNING * INTO v_payment;
  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'refunded', COALESCE(p_payload, '{}'::JSONB));
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.prepare_task_cancel_compensation(
  p_task_id UUID, p_cancellation_reason TEXT
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_task public.tasks; v_payment public.payments;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(p_cancellation_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Alasan pembatalan wajib diisi' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tugas tidak ditemukan' USING ERRCODE = 'P0001'; END IF;
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pembayaran tugas tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  IF v_task.status = 'dibatalkan' AND v_payment.status IN ('dibatalkan_kompensasi', 'refunding') THEN
    RETURN v_payment;
  END IF;
  IF v_task.status <> 'dikonfirmasi' OR v_payment.status <> 'held_escrow' THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibatalkan pada status ini' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.tasks
  SET status = 'dibatalkan', cancellation_reason = BTRIM(p_cancellation_reason),
      cancelled_at = NOW(), updated_at = NOW()
  WHERE id = p_task_id AND status = 'dikonfirmasi';
  UPDATE public.payments
  SET status = 'refunding', updated_at = NOW()
  WHERE id = v_payment.id AND status = 'held_escrow'
  RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_task_cancel_compensation(
  p_task_id UUID, p_refund_payload JSONB
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks; v_payment public.payments; v_helper public.helper_profiles;
  v_compensation NUMERIC;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tugas tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  IF auth.role() <> 'service_role' AND auth.uid() <> v_task.keluarga_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Anda tidak berwenang mengonfirmasi kompensasi' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pembayaran tugas tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  IF v_payment.status = 'dibatalkan_kompensasi' THEN RETURN v_task; END IF;
  IF v_payment.status <> 'refunding' THEN
    RAISE EXCEPTION 'Pembayaran tidak sedang dalam proses refund' USING ERRCODE = 'P0001';
  END IF;

  v_compensation := ROUND(v_payment.jumlah_total * 0.50, 0);
  UPDATE public.payments
  SET status = 'dibatalkan_kompensasi', helper_share = v_compensation,
      platform_fee = 0, koordinator_share = 0, updated_at = NOW()
  WHERE id = v_payment.id AND status = 'refunding';
  IF v_task.helper_id IS NOT NULL THEN
    SELECT * INTO v_helper FROM public.helper_profiles WHERE id = v_task.helper_id FOR UPDATE;
    IF FOUND THEN
      UPDATE public.helper_profiles
      SET saldo_tersedia = saldo_tersedia + v_compensation, updated_at = NOW()
      WHERE id = v_helper.id;
      INSERT INTO public.notifications (user_id, title, body, type)
      VALUES (v_helper.user_id, 'Kompensasi pembatalan', 'Kompensasi 50% dari tugas yang dibatalkan sudah dicatat.', 'payment');
    END IF;
  END IF;
  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'refunded', jsonb_build_object(
    'compensation', v_compensation,
    'family_refund', v_payment.jumlah_total - v_compensation,
    'reason', COALESCE(p_refund_payload, '{}'::JSONB)
  ));
  RETURN v_task;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_release_held_payments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate RECORD; v_payment public.payments; v_task public.tasks;
  v_helper public.helper_profiles; v_koordinator public.koordinator_profiles;
  v_helper_share NUMERIC; v_platform_fee NUMERIC; v_koordinator_share NUMERIC;
  v_released_count INTEGER := 0;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Auto-release hanya dapat dijalankan service role' USING ERRCODE = '42501';
  END IF;
  FOR v_candidate IN
    SELECT p.id AS payment_id
    FROM public.payments p JOIN public.tasks t ON t.id = p.task_id
    WHERE p.status = 'held_escrow' AND p.held_at IS NOT NULL
      AND p.held_at <= NOW() - INTERVAL '72 hours' AND t.status = 'selesai'
    ORDER BY p.held_at FOR UPDATE OF p SKIP LOCKED
  LOOP
    SELECT * INTO v_payment FROM public.payments WHERE id = v_candidate.payment_id FOR UPDATE;
    IF v_payment.status <> 'held_escrow' THEN CONTINUE; END IF;
    SELECT * INTO v_task FROM public.tasks WHERE id = v_payment.task_id FOR UPDATE;
    IF v_task.helper_id IS NOT NULL THEN
      SELECT * INTO v_helper FROM public.helper_profiles WHERE id = v_task.helper_id FOR UPDATE;
      IF FOUND AND v_helper.koordinator_id IS NOT NULL THEN
        SELECT * INTO v_koordinator FROM public.koordinator_profiles WHERE id = v_helper.koordinator_id FOR UPDATE;
      END IF;
    END IF;
    v_helper_share := ROUND(v_payment.jumlah_total * 0.90, 0);
    v_platform_fee := ROUND(v_payment.jumlah_total * 0.07, 0);
    v_koordinator_share := v_payment.jumlah_total - v_helper_share - v_platform_fee;
    UPDATE public.payments
    SET status = 'released', helper_share = v_helper_share, platform_fee = v_platform_fee,
        koordinator_share = v_koordinator_share, released_at = NOW(), updated_at = NOW()
    WHERE id = v_payment.id AND status = 'held_escrow'
    RETURNING * INTO v_payment;
    IF NOT FOUND THEN CONTINUE; END IF;
    IF v_helper.id IS NOT NULL THEN
      UPDATE public.helper_profiles SET saldo_tersedia = saldo_tersedia + v_helper_share, updated_at = NOW()
      WHERE id = v_helper.id;
    END IF;
    IF v_koordinator.id IS NOT NULL THEN
      UPDATE public.koordinator_profiles SET saldo_komisi = saldo_komisi + v_koordinator_share, updated_at = NOW()
      WHERE id = v_koordinator.id;
    END IF;
    INSERT INTO public.transaction_logs (payment_id, event_type, payload)
    VALUES (v_payment.id, 'released', jsonb_build_object(
      'source', 'auto_release', 'helper_share', v_helper_share,
      'platform_fee', v_platform_fee, 'koordinator_share', v_koordinator_share
    ));
    v_released_count := v_released_count + 1;
  END LOOP;
  RETURN v_released_count;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_midtrans_refund(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_midtrans_refund(UUID) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.confirm_midtrans_refund(UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_midtrans_refund(UUID, TEXT, JSONB) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.prepare_task_cancel_compensation(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_task_cancel_compensation(UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.confirm_task_cancel_compensation(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_task_cancel_compensation(UUID, JSONB) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.auto_release_held_payments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_release_held_payments() TO service_role;

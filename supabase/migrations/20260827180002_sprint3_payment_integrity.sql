-- Mengunci identifier payment dan validasi settlement dari provider.

CREATE OR REPLACE FUNCTION public.prepare_midtrans_payment_intent(
  p_task_id UUID,
  p_amount NUMERIC
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_payment public.payments;
  v_order_id TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount < 0 THEN
    RAISE EXCEPTION 'Nominal pembayaran tidak valid' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid()
    AND status IN ('dikonfirmasi', 'dikerjakan', 'selesai')
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibayar oleh akun ini' USING ERRCODE = 'P0001';
  END IF;
  IF p_amount <> v_task.harga_final THEN
    RAISE EXCEPTION 'Nominal pembayaran tidak sama dengan harga final tugas' USING ERRCODE = '22023';
  END IF;

  v_order_id := 'RANGKUL-' || upper(replace(p_task_id::text, '-', ''));
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;

  IF FOUND THEN
    IF v_payment.status IN ('held_escrow', 'released', 'refunding', 'dibatalkan_kompensasi') THEN
      RAISE EXCEPTION 'Pembayaran tugas sudah diproses' USING ERRCODE = '23505';
    END IF;
    IF v_payment.amount <> p_amount
       OR (v_payment.midtrans_snap_token IS NULL AND v_payment.midtrans_order_id IS DISTINCT FROM v_order_id) THEN
      UPDATE public.payments
      SET amount = p_amount,
          jumlah_total = p_amount,
          midtrans_order_id = v_order_id,
          midtrans_snap_token = CASE WHEN v_payment.amount <> p_amount THEN NULL ELSE v_payment.midtrans_snap_token END,
          updated_at = NOW()
      WHERE id = v_payment.id
      RETURNING * INTO v_payment;
    END IF;
    RETURN v_payment;
  END IF;

  INSERT INTO public.payments (
    task_id, amount, jumlah_total, payment_method, status,
    midtrans_order_id, midtrans_snap_token, updated_at
  )
  VALUES (p_task_id, p_amount, p_amount, 'midtrans', 'pending', v_order_id, NULL, NOW())
  RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.settle_midtrans_payment(
  p_order_id TEXT,
  p_gateway_ref TEXT,
  p_payload JSONB
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments;
  v_task public.tasks;
  v_status TEXT;
  v_fraud_status TEXT;
  v_gross_amount NUMERIC;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Webhook tidak terautentikasi' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(p_order_id), '') IS NULL
     OR NULLIF(BTRIM(p_gateway_ref), '') IS NULL
     OR p_payload IS NULL THEN
    RAISE EXCEPTION 'Payload settlement tidak lengkap' USING ERRCODE = '22023';
  END IF;

  v_status := lower(COALESCE(p_payload->>'transaction_status', ''));
  v_fraud_status := lower(COALESCE(p_payload->>'fraud_status', ''));
  IF p_payload->>'order_id' IS DISTINCT FROM p_order_id
     OR p_payload->>'status_code' IS DISTINCT FROM '200' THEN
    RAISE EXCEPTION 'Identifier webhook tidak cocok' USING ERRCODE = '22023';
  END IF;
  IF v_status NOT IN ('settlement', 'capture')
     OR (v_status = 'capture' AND v_fraud_status = 'challenge') THEN
    RAISE EXCEPTION 'Status transaksi belum dapat disettle' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(p_payload->>'gross_amount', '') !~ '^[0-9]+(\.[0-9]+)?$' THEN
    RAISE EXCEPTION 'Nominal webhook tidak valid' USING ERRCODE = '22023';
  END IF;
  v_gross_amount := (p_payload->>'gross_amount')::NUMERIC;

  SELECT * INTO v_payment
  FROM public.payments WHERE midtrans_order_id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order Midtrans tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_payment.status IN ('held_escrow', 'released') THEN
    RETURN v_payment;
  END IF;
  IF v_gross_amount <> v_payment.amount OR v_gross_amount <> v_payment.jumlah_total THEN
    RAISE EXCEPTION 'Nominal webhook tidak sama dengan snapshot pembayaran' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_task FROM public.tasks WHERE id = v_payment.task_id;
  UPDATE public.payments
  SET status = 'held_escrow', gateway_ref = p_gateway_ref,
      held_at = COALESCE(held_at, NOW()), updated_at = NOW()
  WHERE id = v_payment.id
  RETURNING * INTO v_payment;

  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'held', p_payload);
  IF v_task.keluarga_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (v_task.keluarga_id, 'Pembayaran diterima', 'Pembayaran tugas sudah dikonfirmasi oleh Midtrans Sandbox.', 'payment');
  END IF;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_midtrans_snap_token(
  p_task_id UUID,
  p_order_id TEXT,
  p_snap_token TEXT
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(p_order_id), '') IS NULL OR NULLIF(BTRIM(p_snap_token), '') IS NULL THEN
    RAISE EXCEPTION 'Token pembayaran tidak valid' USING ERRCODE = '22023';
  END IF;

  SELECT p.* INTO v_payment
  FROM public.payments p
  JOIN public.tasks t ON t.id = p.task_id
  WHERE p.task_id = p_task_id AND t.keluarga_id = auth.uid()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pembayaran tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF v_payment.status <> 'pending' THEN
    RAISE EXCEPTION 'Pembayaran sudah diproses' USING ERRCODE = '23505';
  END IF;
  IF v_payment.midtrans_order_id IS DISTINCT FROM p_order_id THEN
    RAISE EXCEPTION 'Order pembayaran tidak cocok' USING ERRCODE = '22023';
  END IF;

  UPDATE public.payments
  SET midtrans_snap_token = COALESCE(midtrans_snap_token, p_snap_token), updated_at = NOW()
  WHERE id = v_payment.id
  RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_midtrans_payment_intent(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_midtrans_payment_intent(UUID, NUMERIC) TO authenticated;
REVOKE ALL ON FUNCTION public.save_midtrans_snap_token(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_midtrans_snap_token(UUID, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.settle_midtrans_payment(TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_midtrans_payment(TEXT, TEXT, JSONB) TO service_role;

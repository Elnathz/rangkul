-- Migration untuk memperbaiki race condition refund
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_status' AND e.enumlabel = 'refunding') THEN
    ALTER TYPE public.payment_status ADD VALUE 'refunding';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.prepare_task_cancel_compensation(
  p_task_id UUID,
  p_cancellation_reason TEXT
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_payment public.payments;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Keluarga tidak valid' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid() FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak ditemukan' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  
  IF v_task.status = 'dibatalkan' AND v_payment.status IN ('dibatalkan_kompensasi', 'refunding') THEN
    RETURN v_payment;
  END IF;
  
  IF v_task.status <> 'dikonfirmasi' OR v_payment.status <> 'held_escrow' THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibatalkan pada status ini' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.tasks
  SET status = 'dibatalkan', cancellation_reason = BTRIM(p_cancellation_reason),
      cancelled_at = NOW(), updated_at = NOW()
  WHERE id = p_task_id;

  UPDATE public.payments
  SET status = 'refunding', updated_at = NOW()
  WHERE id = v_payment.id
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_task_cancel_compensation(
  p_task_id UUID,
  p_refund_payload JSONB
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  v_payment public.payments;
  v_helper public.helper_profiles;
  v_compensation NUMERIC;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;

  IF v_payment.status = 'dibatalkan_kompensasi' THEN
    RETURN v_task; -- Idempotent
  END IF;

  IF v_payment.status <> 'refunding' THEN
    RAISE EXCEPTION 'Pembayaran tidak sedang dalam proses refund' USING ERRCODE = 'P0001';
  END IF;

  v_compensation := ROUND(v_payment.jumlah_total * 0.50, 0);

  UPDATE public.payments
  SET status = 'dibatalkan_kompensasi', helper_share = v_compensation,
      platform_fee = 0, koordinator_share = 0, updated_at = NOW()
  WHERE id = v_payment.id;

  SELECT * INTO v_helper FROM public.helper_profiles WHERE user_id = v_task.helper_id;
  IF FOUND THEN
    UPDATE public.helper_profiles
    SET balance = balance + v_compensation, updated_at = NOW()
    WHERE id = v_helper.id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_helper.user_id, 'Kompensasi pembatalan', 'Kompensasi 50% dari tugas yang dibatalkan sudah dicatat.', 'payment');
  END IF;

  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'refunded', p_refund_payload);

  RETURN v_task;
END;
$$;

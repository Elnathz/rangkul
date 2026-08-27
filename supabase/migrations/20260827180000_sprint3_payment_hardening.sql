-- Migration untuk memperbaiki idempotency payment dan race condition refund

-- 1. Fungsi untuk mengunci dan membuat row payment sebelum menembak Midtrans
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

  SELECT * INTO v_task FROM public.tasks
  WHERE id = p_task_id AND keluarga_id = auth.uid()
    AND status IN ('dikonfirmasi', 'dikerjakan', 'selesai') FOR UPDATE;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibayar oleh akun ini' USING ERRCODE = 'P0001';
  END IF;
  
  IF p_amount <> v_task.harga_final THEN
    RAISE EXCEPTION 'Nominal pembayaran tidak sama dengan harga final tugas' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  
  IF FOUND THEN
    IF v_payment.status IN ('held_escrow', 'released', 'dibatalkan_kompensasi') THEN
      RAISE EXCEPTION 'Pembayaran tugas sudah diproses' USING ERRCODE = '23505';
    END IF;
    -- Jika pending tapi nominal berubah (misalnya setelah refund/cancel gagal lalu coba lagi)
    IF v_payment.amount <> p_amount THEN
      UPDATE public.payments SET 
        amount = p_amount, 
        jumlah_total = p_amount,
        midtrans_order_id = 'RANGKUL-' || upper(substring(p_task_id::text from 1 for 8)) || '-' || extract(epoch from now())::int,
        midtrans_snap_token = NULL,
        updated_at = NOW()
      WHERE id = v_payment.id RETURNING * INTO v_payment;
    END IF;
    RETURN v_payment;
  END IF;

  v_order_id := 'RANGKUL-' || upper(substring(p_task_id::text from 1 for 8)) || '-' || extract(epoch from now())::int;
  
  INSERT INTO public.payments (
    task_id, amount, jumlah_total, payment_method, status,
    midtrans_order_id, midtrans_snap_token, updated_at
  )
  VALUES (
    p_task_id, p_amount, p_amount, 'midtrans', 'pending',
    v_order_id, NULL, NOW()
  ) RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

-- 2. Fungsi untuk menyimpan snap token (idempotent)
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
  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment tidak ditemukan' USING ERRCODE = 'P0001';
  END IF;
  
  IF v_payment.midtrans_order_id = p_order_id THEN
    UPDATE public.payments 
    SET midtrans_snap_token = p_snap_token, updated_at = NOW() 
    WHERE id = v_payment.id 
    RETURNING * INTO v_payment;
  END IF;
  
  RETURN v_payment;
END;
$$;

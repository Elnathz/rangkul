-- Pembayaran harus diterima sebelum Helper dapat memulai Kunjungan.
-- Kunjungan terjadwal yang belum dibayar saat waktu mulai lewat dibatalkan oleh job service-role.

CREATE OR REPLACE FUNCTION public.expire_unpaid_confirmed_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
  expired_count INTEGER := 0;
BEGIN
  FOR v_task IN
    UPDATE public.tasks task
    SET
      status = 'dibatalkan',
      cancelled_at = COALESCE(task.cancelled_at, NOW()),
      cancellation_reason = COALESCE(
        task.cancellation_reason,
        'Kunjungan otomatis dibatalkan karena pembayaran belum diterima sebelum jadwal dimulai.'
      ),
      updated_at = NOW()
    WHERE task.status = 'dikonfirmasi'
      AND task.jadwal_waktu <= NOW()
      AND NOT EXISTS (
        SELECT 1
        FROM public.payments payment
        WHERE payment.task_id = task.id
          AND payment.status IN ('held_escrow', 'released')
      )
    RETURNING task.*
  LOOP
    expired_count := expired_count + 1;
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
      v_task.keluarga_id,
      'Kunjungan dibatalkan karena pembayaran belum diterima',
      'Jadwal telah lewat sebelum pembayaran diterima. Silakan buat Kunjungan baru bila masih diperlukan.',
      'payment'
    );
  END LOOP;

  RETURN expired_count;
END;
$$;

DROP POLICY IF EXISTS "Verified helper can start confirmed tasks" ON public.tasks;

CREATE POLICY "Verified helper can start confirmed tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    status = 'dikonfirmasi'
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles helper
      WHERE helper.id = tasks.helper_id
        AND helper.user_id = auth.uid()
        AND helper.status = 'verified'
    )
    AND EXISTS (
      SELECT 1
      FROM public.payments payment
      WHERE payment.task_id = tasks.id
        AND payment.status IN ('held_escrow', 'released')
    )
  )
  WITH CHECK (
    status = 'dikerjakan'
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles helper
      WHERE helper.id = tasks.helper_id
        AND helper.user_id = auth.uid()
        AND helper.status = 'verified'
    )
  );

REVOKE ALL ON FUNCTION public.expire_unpaid_confirmed_tasks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_unpaid_confirmed_tasks() TO service_role;

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

  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
    AND keluarga_id = auth.uid()
    AND status IN ('dikonfirmasi', 'dikerjakan', 'selesai')
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak dapat dibayar oleh akun ini' USING ERRCODE = 'P0001';
  END IF;
  IF v_task.status = 'dikonfirmasi' AND v_task.jadwal_waktu <= NOW() THEN
    RAISE EXCEPTION 'Batas pembayaran sudah lewat' USING ERRCODE = 'P0001';
  END IF;
  IF p_amount <> v_task.harga_final THEN
    RAISE EXCEPTION 'Nominal pembayaran tidak sama dengan harga final tugas' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF FOUND THEN
    IF v_payment.status IN ('held_escrow', 'released', 'dibatalkan_kompensasi') THEN
      RAISE EXCEPTION 'Pembayaran tugas sudah diproses' USING ERRCODE = '23505';
    END IF;
    IF v_payment.amount <> p_amount THEN
      UPDATE public.payments
      SET amount = p_amount,
          jumlah_total = p_amount,
          midtrans_order_id = 'RANGKUL-' || upper(substring(p_task_id::text from 1 for 8)) || '-' || extract(epoch from now())::int,
          midtrans_snap_token = NULL,
          updated_at = NOW()
      WHERE id = v_payment.id
      RETURNING * INTO v_payment;
    END IF;
    RETURN v_payment;
  END IF;

  v_order_id := 'RANGKUL-' || upper(substring(p_task_id::text from 1 for 8)) || '-' || extract(epoch from now())::int;
  INSERT INTO public.payments (
    task_id, amount, jumlah_total, payment_method, status,
    midtrans_order_id, midtrans_snap_token, updated_at
  ) VALUES (
    p_task_id, p_amount, p_amount, 'midtrans', 'pending',
    v_order_id, NULL, NOW()
  ) RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.charge_task_with_demo_wallet(
  p_task_id UUID,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE (
  payment_id UUID,
  status public.payment_status,
  saldo_tersisa NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  v_task public.tasks;
  v_wallet public.demo_wallets;
  v_charge NUMERIC;
  v_payment public.payments;
  v_helper_share NUMERIC;
  v_platform_fee NUMERIC;
  v_koordinator_share NUMERIC;
  v_new_balance NUMERIC;
  v_ledger_id UUID;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Sesi tidak valid' USING ERRCODE = '28000';
  END IF;
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak ditemukan' USING ERRCODE = '22023';
  END IF;
  IF v_task.keluarga_id <> caller_id THEN
    RAISE EXCEPTION 'Anda tidak memiliki akses ke tugas ini' USING ERRCODE = '42501';
  END IF;
  IF v_task.status NOT IN ('dikonfirmasi', 'dikerjakan', 'selesai') THEN
    RAISE EXCEPTION 'Tugas belum berada pada tahap pembayaran' USING ERRCODE = '40900';
  END IF;
  IF v_task.status = 'dikonfirmasi' AND v_task.jadwal_waktu <= NOW() THEN
    RAISE EXCEPTION 'Batas pembayaran sudah lewat' USING ERRCODE = '40900';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE task_id = p_task_id FOR UPDATE;
  IF FOUND THEN
    IF v_payment.payment_method = 'saldo_demo'
       AND v_payment.status IN ('held_escrow', 'released')
       AND v_payment.idempotency_key IS NOT DISTINCT FROM p_idempotency_key THEN
      SELECT COALESCE(saldo, 0) INTO v_new_balance
      FROM public.demo_wallets WHERE user_id = caller_id;
      RETURN QUERY SELECT v_payment.id, v_payment.status, v_new_balance;
      RETURN;
    END IF;
    RAISE EXCEPTION 'Tugas ini sudah memiliki pembayaran berjalan' USING ERRCODE = '40900';
  END IF;

  v_charge := COALESCE(v_task.harga_final, 0);
  IF v_charge <= 0 THEN
    RAISE EXCEPTION 'Nilai pembayaran tugas tidak valid' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_wallet FROM public.demo_wallets WHERE user_id = caller_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.demo_wallets (user_id, saldo) VALUES (caller_id, 0);
    SELECT * INTO v_wallet FROM public.demo_wallets WHERE user_id = caller_id;
  END IF;
  IF v_wallet.saldo < v_charge THEN
    RAISE EXCEPTION 'Saldo Demo tidak mencukupi' USING ERRCODE = '45001', DETAIL = v_wallet.saldo::TEXT;
  END IF;

  v_new_balance := v_wallet.saldo - v_charge;
  UPDATE public.demo_wallets SET saldo = v_new_balance, updated_at = NOW() WHERE id = v_wallet.id;
  INSERT INTO public.demo_wallet_ledger (wallet_id, user_id, amount, saldo_setelah, alasan, created_by, entry_type)
  VALUES (v_wallet.id, caller_id, v_charge, v_new_balance,
    'Pembayaran tugas ' || LEFT(p_task_id::TEXT, 8) || ' dengan Saldo Demo', caller_id, 'charge')
  RETURNING id INTO v_ledger_id;

  v_helper_share := ROUND(v_charge * 0.90);
  v_platform_fee := ROUND(v_charge * 0.07);
  v_koordinator_share := v_charge - v_helper_share - v_platform_fee;
  INSERT INTO public.payments (
    task_id, amount, jumlah_total, helper_share, platform_fee, koordinator_share,
    status, payment_method, held_at, idempotency_key, updated_at
  ) VALUES (
    p_task_id, v_charge, v_charge, v_helper_share, v_platform_fee, v_koordinator_share,
    'held_escrow', 'saldo_demo', NOW(), p_idempotency_key, NOW()
  ) RETURNING * INTO v_payment;
  INSERT INTO public.transaction_logs (payment_id, event_type, payload)
  VALUES (v_payment.id, 'held', jsonb_build_object('method', 'saldo_demo', 'amount', v_charge, 'actor_id', caller_id, 'task_id', p_task_id));
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (caller_id, 'demo_wallet_charge', 'payments', v_payment.id, jsonb_build_object(
    'task_id', p_task_id, 'amount', v_charge, 'saldo_tersisa', v_new_balance, 'ledger_id', v_ledger_id));
  RETURN QUERY SELECT v_payment.id, v_payment.status, v_new_balance;
END;
$$;

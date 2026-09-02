-- Fungsi self top-up demo wallet untuk Keluarga (tanpa pengecekan is_admin)
-- Keluarga dapat menambah saldo sendiri dalam mode demo.
CREATE OR REPLACE FUNCTION public.keluarga_self_topup_demo_wallet(
  topup_amount NUMERIC,
  topup_reason TEXT DEFAULT 'Self top-up demo oleh keluarga'
)
RETURNS public.demo_wallet_ledger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  wallet public.demo_wallets;
  ledger public.demo_wallet_ledger;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Sesi tidak valid' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = caller_id AND role = 'keluarga') THEN
    RAISE EXCEPTION 'Hanya akun Keluarga yang dapat mengisi saldo demo' USING ERRCODE = '42501';
  END IF;

  IF topup_amount IS NULL OR topup_amount <= 0 OR topup_amount > 10000000 THEN
    RAISE EXCEPTION 'Nominal top up harus lebih dari nol dan maksimal Rp10.000.000' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.demo_wallets (user_id, saldo)
  VALUES (caller_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO wallet FROM public.demo_wallets WHERE user_id = caller_id FOR UPDATE;
  UPDATE public.demo_wallets
  SET saldo = saldo + topup_amount, updated_at = NOW()
  WHERE id = wallet.id
  RETURNING * INTO wallet;

  INSERT INTO public.demo_wallet_ledger (wallet_id, user_id, amount, saldo_setelah, alasan, created_by)
  VALUES (wallet.id, caller_id, topup_amount, wallet.saldo, BTRIM(COALESCE(topup_reason, 'Self top-up')), caller_id)
  RETURNING * INTO ledger;

  RETURN ledger;
END;
$$;

REVOKE ALL ON FUNCTION public.keluarga_self_topup_demo_wallet(NUMERIC, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.keluarga_self_topup_demo_wallet(NUMERIC, TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.demo_wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.demo_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  saldo_setelah NUMERIC NOT NULL CHECK (saldo_setelah >= 0),
  alasan TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_wallet_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read demo wallet ledger" ON public.demo_wallet_ledger;
CREATE POLICY "Admin can read demo wallet ledger" ON public.demo_wallet_ledger
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Family can read own appeals" ON public.appeals;
CREATE POLICY "Family can read own appeals" ON public.appeals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Family can create own appeals" ON public.appeals;
CREATE POLICY "Family can create own appeals" ON public.appeals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage appeals" ON public.appeals;
CREATE POLICY "Admin can manage appeals" ON public.appeals
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.admin_topup_demo_wallet(
  target_user_id UUID,
  topup_amount NUMERIC,
  topup_reason TEXT
)
RETURNS public.demo_wallet_ledger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet public.demo_wallets;
  ledger public.demo_wallet_ledger;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat melakukan top up' USING ERRCODE = '42501';
  END IF;
  IF topup_amount IS NULL OR topup_amount <= 0 OR topup_amount > 10000000 THEN
    RAISE EXCEPTION 'Nominal top up harus lebih dari nol dan maksimal Rp10.000.000' USING ERRCODE = '22023';
  END IF;
  IF NULLIF(BTRIM(topup_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Alasan top up wajib diisi' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id AND role = 'keluarga') THEN
    RAISE EXCEPTION 'Wallet demo hanya tersedia untuk akun Keluarga' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.demo_wallets (user_id, saldo)
  VALUES (target_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO wallet FROM public.demo_wallets WHERE user_id = target_user_id FOR UPDATE;
  UPDATE public.demo_wallets
  SET saldo = saldo + topup_amount, updated_at = NOW()
  WHERE id = wallet.id
  RETURNING * INTO wallet;

  INSERT INTO public.demo_wallet_ledger (wallet_id, user_id, amount, saldo_setelah, alasan, created_by)
  VALUES (wallet.id, target_user_id, topup_amount, wallet.saldo, BTRIM(topup_reason), auth.uid())
  RETURNING * INTO ledger;
  RETURN ledger;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_topup_demo_wallet(UUID, NUMERIC, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_topup_demo_wallet(UUID, NUMERIC, TEXT) TO authenticated;

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
  updated_appeal public.appeals;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat meninjau banding' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(BTRIM(review_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Alasan keputusan banding wajib diisi' USING ERRCODE = '22023';
  END IF;

  UPDATE public.appeals
  SET status = next_status, direview_oleh = auth.uid(), direview_at = NOW()
  WHERE id = appeal_id AND status = 'menunggu'
  RETURNING * INTO updated_appeal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banding tidak ditemukan atau sudah ditinjau' USING ERRCODE = 'P0001';
  END IF;

  IF next_status = 'disetujui' THEN
    UPDATE public.users
    SET account_status = 'active', updated_at = NOW()
    WHERE id = updated_appeal.user_id;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'resolve_appeal', 'appeal', appeal_id, jsonb_build_object('status', next_status, 'reason', BTRIM(review_reason), 'user_id', updated_appeal.user_id));
  RETURN updated_appeal;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_appeal(UUID, public.appeal_status, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_review_appeal(UUID, public.appeal_status, TEXT) TO authenticated;

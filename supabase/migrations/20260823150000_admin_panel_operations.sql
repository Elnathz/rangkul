CREATE OR REPLACE FUNCTION public.prevent_sensitive_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin()
     AND (NEW.role IS DISTINCT FROM OLD.role
       OR NEW.account_status IS DISTINCT FROM OLD.account_status
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.id IS DISTINCT FROM OLD.id) THEN
    RAISE EXCEPTION 'Perubahan kolom sensitif tidak diizinkan';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_account_status(
  target_user_id UUID,
  next_status public.account_status
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_user public.users;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Hanya Admin yang dapat mengubah status akun';
  END IF;

  IF target_user_id = auth.uid() AND next_status = 'suspended' THEN
    RAISE EXCEPTION 'Admin tidak dapat menangguhkan akun sendiri';
  END IF;

  UPDATE public.users
  SET account_status = next_status, updated_at = NOW()
  WHERE id = target_user_id
  RETURNING * INTO updated_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengguna tidak ditemukan';
  END IF;

  RETURN updated_user;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_account_status(UUID, public.account_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_account_status(UUID, public.account_status) TO authenticated;

DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
CREATE POLICY "Admin can update all users" ON public.users
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can read audit logs" ON public.audit_logs;
CREATE POLICY "Admin can read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated actor can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated actor can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.is_admin());

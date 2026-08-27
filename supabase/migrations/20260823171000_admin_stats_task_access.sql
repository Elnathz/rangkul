DROP POLICY IF EXISTS "Admin can read all tasks" ON public.tasks;

CREATE POLICY "Admin can read all tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (public.is_admin());

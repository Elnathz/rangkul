-- Sprint 2: Helper boleh check-in hanya pada task miliknya yang sudah dikonfirmasi.

DROP POLICY IF EXISTS "Verified helper can start confirmed tasks" ON public.tasks;

CREATE POLICY "Verified helper can start confirmed tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  status = 'dikonfirmasi'
  AND EXISTS (
    SELECT 1
    FROM public.helper_profiles AS hp
    WHERE hp.id = tasks.helper_id
      AND hp.user_id = auth.uid()
      AND hp.status = 'verified'
  )
)
WITH CHECK (
  status = 'dikerjakan'
  AND EXISTS (
    SELECT 1
    FROM public.helper_profiles AS hp
    WHERE hp.id = tasks.helper_id
      AND hp.user_id = auth.uid()
      AND hp.status = 'verified'
  )
);

-- Sprint 2: buka akses task sesuai peran tanpa membocorkan task milik pengguna lain.

CREATE POLICY "Keluarga can create own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = keluarga_id);

CREATE POLICY "Keluarga can read own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (auth.uid() = keluarga_id);

CREATE POLICY "Verified helper can read task marketplace"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  (
    status = 'diajukan'
    AND helper_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.helper_profiles
      WHERE user_id = auth.uid()
        AND status = 'verified'
    )
  )
  OR EXISTS (
    SELECT 1
    FROM public.helper_profiles
    WHERE id = tasks.helper_id
      AND user_id = auth.uid()
  )
);

CREATE POLICY "Verified helper can claim available tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  status = 'diajukan'
  AND EXISTS (
    SELECT 1
    FROM public.helper_profiles
    WHERE user_id = auth.uid()
      AND status = 'verified'
  )
  AND (
    helper_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.helper_profiles
      WHERE id = tasks.helper_id
        AND user_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.helper_profiles
    WHERE id = tasks.helper_id
      AND user_id = auth.uid()
      AND status = 'verified'
  )
  AND status IN ('dikonfirmasi', 'menunggu_persetujuan_koordinator')
);

CREATE POLICY "Helper can read related lansia task details"
ON public.lansia_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks
    WHERE tasks.lansia_id = lansia_profiles.id
      AND (
        (
          tasks.status = 'diajukan'
          AND tasks.helper_id IS NULL
          AND EXISTS (
            SELECT 1
            FROM public.helper_profiles
            WHERE user_id = auth.uid()
              AND status = 'verified'
          )
        )
        OR EXISTS (
          SELECT 1
          FROM public.helper_profiles
          WHERE id = tasks.helper_id
            AND user_id = auth.uid()
        )
      )
  )
);

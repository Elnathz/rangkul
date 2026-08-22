-- Sprint 2: laporan Helper, Health Snapshot, dan konfirmasi selesai yang atomic.

DROP POLICY IF EXISTS "Task participants can read task evidence" ON public.task_evidence;
CREATE POLICY "Task participants can read task evidence"
ON public.task_evidence
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = task_evidence.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Task participants can read health snapshots" ON public.health_snapshots;
CREATE POLICY "Task participants can read health snapshots"
ON public.health_snapshots
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    WHERE t.id = health_snapshots.task_id
      AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
  )
);

CREATE OR REPLACE FUNCTION public.notify_family_of_task_evidence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_keluarga_id UUID;
BEGIN
  SELECT keluarga_id INTO v_keluarga_id FROM public.tasks WHERE id = NEW.task_id;
  IF v_keluarga_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
      v_keluarga_id,
      'Laporan kunjungan tersedia',
      'Helper sudah mengirim foto, catatan kondisi, dan Health Snapshot untuk kunjunganmu.',
      'task'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_evidence_inserted ON public.task_evidence;
CREATE TRIGGER on_task_evidence_inserted
AFTER INSERT ON public.task_evidence
FOR EACH ROW EXECUTE FUNCTION public.notify_family_of_task_evidence();

CREATE OR REPLACE FUNCTION public.submit_task_evidence(
  p_task_id UUID,
  p_foto_bukti_url TEXT,
  p_catatan_kondisi TEXT,
  p_energi INT,
  p_mobilitas INT,
  p_mood INT,
  p_nafsu_makan INT,
  p_kualitas_tidur INT,
  p_cerita_hari_ini TEXT,
  p_client_submission_id TEXT
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk mengirim laporan'
      USING ERRCODE = '42501';
  END IF;

  SELECT t.* INTO v_task
  FROM public.tasks t
  JOIN public.helper_profiles hp ON hp.id = t.helper_id
  JOIN public.task_evidence existing ON existing.task_id = t.id
  WHERE t.id = p_task_id
    AND hp.user_id = auth.uid()
    AND existing.client_submission_id = p_client_submission_id;

  IF FOUND THEN
    RETURN v_task;
  END IF;

  SELECT t.* INTO v_task
  FROM public.tasks t
  JOIN public.helper_profiles hp ON hp.id = t.helper_id
  WHERE t.id = p_task_id
    AND hp.user_id = auth.uid()
    AND t.status = 'dikerjakan'
  FOR UPDATE OF t;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas tidak sedang dikerjakan oleh Helper ini'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_foto_bukti_url IS NULL OR NULLIF(BTRIM(p_foto_bukti_url), '') IS NULL THEN
    RAISE EXCEPTION 'Foto bukti wajib diunggah'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.task_evidence (task_id, foto_bukti_url, catatan_kondisi, client_submission_id)
  VALUES (p_task_id, BTRIM(p_foto_bukti_url), BTRIM(p_catatan_kondisi), p_client_submission_id);

  INSERT INTO public.health_snapshots (
    task_id, lansia_id, energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini
  )
  VALUES (
    p_task_id, v_task.lansia_id, p_energi, p_mobilitas, p_mood, p_nafsu_makan,
    p_kualitas_tidur, NULLIF(BTRIM(p_cerita_hari_ini), '')
  );

  UPDATE public.tasks
  SET status = 'selesai',
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_task_id
    AND status = 'dikerjakan'
  RETURNING * INTO v_task;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status tugas sudah berubah'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN v_task;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Laporan tugas sudah dikirim'
      USING ERRCODE = '23505';
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_task_completion(p_task_id UUID)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.tasks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Anda harus login untuk mengonfirmasi tugas'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.tasks
  SET updated_at = NOW()
  WHERE id = p_task_id
    AND keluarga_id = auth.uid()
    AND status = 'selesai'
    AND EXISTS (SELECT 1 FROM public.task_evidence e WHERE e.task_id = tasks.id)
  RETURNING * INTO v_task;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tugas belum siap dikonfirmasi atau bukan milik keluarga ini'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN v_task;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_task_evidence(UUID, TEXT, TEXT, INT, INT, INT, INT, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_task_completion(UUID) TO authenticated;

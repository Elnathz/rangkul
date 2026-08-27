-- Menutup review report dengan scope reviewer dan audit keputusan.

CREATE OR REPLACE FUNCTION public.handle_report_accumulation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE active_report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_report_count FROM public.reports
  WHERE reported_helper_id = NEW.reported_helper_id AND status IN ('menunggu', 'ditindak');
  IF active_report_count >= 2 THEN
    UPDATE public.helper_profiles SET status = 'under_review', updated_at = NOW()
    WHERE user_id = NEW.reported_helper_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_report(
  p_report_id UUID,
  p_status public.report_status,
  p_helper_status public.helper_status DEFAULT NULL,
  p_decision_reason TEXT DEFAULT NULL
)
RETURNS public.reports LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_report public.reports; v_helper public.helper_profiles; v_is_admin BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi reviewer tidak valid' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_report FROM public.reports WHERE id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Laporan tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  v_is_admin := public.is_admin();
  SELECT hp.* INTO v_helper FROM public.helper_profiles hp
  WHERE hp.user_id = v_report.reported_helper_id
    AND (
      v_is_admin
      OR EXISTS (
        SELECT 1 FROM public.koordinator_profiles kp
        WHERE kp.id = hp.koordinator_id AND kp.user_id = auth.uid() AND kp.status = 'verified'
      )
    )
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reviewer tidak memiliki scope untuk laporan ini' USING ERRCODE = '42501'; END IF;
  IF p_helper_status IS NOT NULL AND NULLIF(BTRIM(p_decision_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Alasan keputusan Helper wajib diisi' USING ERRCODE = '22023';
  END IF;
  IF p_helper_status = 'verified' AND p_status <> 'selesai' THEN
    RAISE EXCEPTION 'Pemulihan Helper hanya dapat dilakukan saat laporan selesai' USING ERRCODE = '22023';
  END IF;
  UPDATE public.reports SET status = p_status, ditindak_oleh = auth.uid(), updated_at = NOW()
  WHERE id = v_report.id RETURNING * INTO v_report;
  IF p_helper_status IS NOT NULL THEN
    UPDATE public.helper_profiles SET status = p_helper_status,
      suspend_reason = CASE WHEN p_helper_status = 'suspended' THEN BTRIM(p_decision_reason) ELSE NULL END,
      updated_at = NOW() WHERE id = v_helper.id;
  END IF;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'report_review_decided', 'report', v_report.id, jsonb_build_object(
    'report_status', p_status, 'helper_status', p_helper_status,
    'decision_reason', NULLIF(BTRIM(p_decision_reason), ''),
    'reported_helper_id', v_report.reported_helper_id));
  RETURN v_report;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_under_review_task_acceptance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_helper_status public.helper_status;
BEGIN
  IF NEW.status IN ('dikonfirmasi', 'menunggu_persetujuan_koordinator') AND NEW.helper_id IS NOT NULL THEN
    SELECT status INTO v_helper_status FROM public.helper_profiles WHERE id = NEW.helper_id;
    IF v_helper_status = 'under_review' THEN
      RAISE EXCEPTION 'Helper sedang dalam peninjauan dan tidak dapat menerima tugas' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prevent_under_review_acceptance ON public.tasks;
CREATE TRIGGER prevent_under_review_acceptance BEFORE INSERT OR UPDATE OF helper_id, status ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.prevent_under_review_task_acceptance();

REVOKE ALL ON FUNCTION public.review_report(UUID, public.report_status, public.helper_status, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_report(UUID, public.report_status, public.helper_status, TEXT) TO authenticated;

DROP POLICY IF EXISTS "Koordinator can send or receive messages freely" ON public.messages;
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
CREATE POLICY "Task participants can read messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = messages.task_id AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Message receivers can mark read" ON public.messages;
CREATE POLICY "Task participants can mark messages read" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    task_id IS NOT NULL AND auth.uid() = receiver_id AND EXISTS (
      SELECT 1 FROM public.tasks t
      LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
      WHERE t.id = messages.task_id AND (t.keluarga_id = auth.uid() OR hp.user_id = auth.uid())
    )
  )
  WITH CHECK (auth.uid() = receiver_id AND task_id IS NOT NULL);
